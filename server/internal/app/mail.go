package app

import (
	"strings"

	"github.com/the-clothing-loop/website/server/internal/app/goscope"

	"github.com/wneessen/go-mail"
)

var mailClient *mail.Client

func MailInit() {
	var err error
	mailClient, err = mail.NewClient(Config.SMTP_HOST, mail.WithPort(Config.SMTP_PORT))
	if err != nil {
		panic(err)
	}

	if Config.SMTP_PASS == "" {
		mailClient.SetTLSPolicy(mail.NoTLS)
	} else {
		mailClient.SetSMTPAuth(mail.SMTPAuthPlain)
		mailClient.SetUsername(Config.SMTP_USER)
		mailClient.SetPassword(Config.SMTP_PASS)
	}
}

func MailCreate() *mail.Msg {
	m := mail.NewMsg()
	m.FromFormat("The Clothing Loop", Config.SMTP_SENDER)
	return m
}

func MailSend(m *mail.Msg) error {
	if to := m.GetTo(); Config.ENV == EnvEnumAcceptance && strings.HasSuffix(to[0].Address, "@example.com") {
		return nil
	}
	err := mailClient.DialAndSend(m)
	if err != nil {
		goscope.Log.Errorf("Unable to send email: %v", err)
		return err
	}

	return err
}
