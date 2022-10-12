package models

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

var ErrUserNotFound = errors.New("User not found")

type User struct {
	ID              uint           `json:"-"`
	UID             string         `json:"uid" gorm:"uniqueIndex"`
	FID             sql.NullString `json:"-" gorm:"column:fid"`
	Email           string         `json:"email" gorm:"unique"`
	IsEmailVerified bool           `json:"is_email_verified"`
	IsRootAdmin     bool           `json:"is_root_admin"`
	Name            string         `json:"name"`
	PhoneNumber     string         `json:"phone_number"`
	Address         string         `json:"address"`
	Sizes           []string       `json:"sizes" gorm:"serializer:json"`
	Enabled         bool           `json:"enabled"`
	LastSignedInAt  time.Time      `json:"-"`
	UserToken       []UserToken    `json:"-"`
	Chains          []UserChain    `json:"chains"`
	CreatedAt       time.Time      `json:"-"`
	UpdatedAt       time.Time      `json:"-"`
}

const (
	RoleUser       = 1
	RoleChainAdmin = 2
	RoleRootAdmin  = 3
)

type UserToken struct {
	ID        uint
	Token     string `gorm:"unique"`
	Verified  bool
	UserID    uint
	CreatedAt int64
}

type UserChain struct {
	ID           uint   `json:"-"`
	UserID       uint   `json:"-" gorm:"index"`
	UserUID      string `json:"user_uid" gorm:"-:migration;<-:false"`
	ChainID      uint   `json:"-"`
	ChainUID     string `json:"chain_uid" gorm:"-:migration;<-:false"`
	IsChainAdmin bool   `json:"is_chain_admin"`
}

type UserChainResponse struct {
	ChainUID     string `json:"chain_uid"`
	UserUID      string `json:"user_uid"`
	IsChainAdmin bool   `json:"is_chain_admin"`
}

// Use of an empty user with just the ID included is fine
//
// ```go
// user := &User{ID: id}
// user.GetChainUIDsAndIsAdminByUserID(db)
// ```
func (u *User) GetUserChainResponse(db *gorm.DB) (results *[]UserChainResponse, err error) {
	results = &[]UserChainResponse{}
	err = db.Raw(`
SELECT
	chains.uid AS chain_uid,
	users.uid AS user_uid,
	user_chains.is_chain_admin AS is_chain_admin
FROM user_chains
LEFT JOIN chains ON user_chains.chain_id = chains.id 
LEFT JOIN users ON user_chains.user_id = users.id 
WHERE user_chains.user_id = ?
	`, u.ID).Scan(results).Error
	if err != nil {
		return nil, fmt.Errorf("unable to look for chains related to user")
	}

	return results, nil
}

func (u *User) AddUserChainsToObject(db *gorm.DB) error {
	userChains := []UserChain{}
	err := db.Raw(`
SELECT
	user_chains.id             AS id,
	user_chains.chain_id       AS chain_id,
	chains.uid                 AS chain_uid,
	user_chains.user_id        AS user_id,
	users.uid                  AS user_uid,
	user_chains.is_chain_admin AS is_chain_admin
FROM user_chains
LEFT JOIN chains ON user_chains.chain_id = chains.id
LEFT JOIN users ON user_chains.user_id = users.id
WHERE users.id = ?
	`, u.ID).Scan(&userChains).Error
	if err != nil {
		return err
	}

	u.Chains = userChains
	return nil
}

func (u *User) IsPartOfChain(db *gorm.DB, chainID uint) bool {
	var count int
	db.Raw(`
SELECT COUNT(user_chains.id)
FROM user_chains
LEFT JOIN users ON user_chains.user_id = users.id
WHERE user_chains.user_id = ?
	AND user_chains.chain_id = ?
	`, u.ID, chainID).Scan(&count)
	return count != 0
}
