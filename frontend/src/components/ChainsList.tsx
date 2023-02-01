import { useState, useContext, useEffect, MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { DataExport } from "../components/DataExport";
import { AuthContext } from "../providers/AuthProvider";
import { chainGet, chainGetAll, chainRemoveUser } from "../api/chain";
import { Chain } from "../api/types";
import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";

export default function ChainsList() {
  const { t } = useTranslation();
  const { authUser, authUserRefresh } = useContext(AuthContext);
  const { addToastError, addToastStatic } = useContext(ToastContext);
  const [chains, setChains] = useState<Chain[]>();

  useEffect(() => {
    load();
  }, [authUser]);

  async function load() {
    if (authUser) {
      try {
        let _chains: Chain[];
        if (authUser.is_root_admin) {
          _chains = (await chainGetAll({ filter_out_unpublished: false })).data;
        } else {
          let data = await Promise.all(
            authUser.chains.map((uc) => chainGet(uc.chain_uid))
          );
          _chains = data.map((d) => d.data);
        }
        setChains(_chains.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err: any) {
        console.error(err);
        addToastError(GinParseErrors(t, err), err.status);
      }
    }
  }

  function handleClickUnsubscribe(e: MouseEvent, chain: Chain) {
    e.preventDefault();
    addToastStatic({
      message: t("areYouSureLeaveLoop", {
        name: authUser?.name,
        chain: chain.name,
      }),
      type: "warning",
      actions: [
        {
          text: t("leave"),
          type: "ghost",
          fn: async () => {
            try {
              await chainRemoveUser(chain.uid, authUser!.uid);
            } catch (err: any) {
              console.error(err);
              addToastError(GinParseErrors(t, err), err.status);
            }

            authUserRefresh();
          },
        },
      ],
    });
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Loops List</title>
        <meta name="description" content="Loops List" />z
      </Helmet>
      <main>
        <div className={`container mx-auto ${chains ? "" : "animate-pulse"}`}>
          <div className="flex flex-row justify-between px-4 md:px-20 py-4">
            <h2 className="text-2xl font-bold mb-3">{`${
              chains?.length || 0
            } Clothing Loops`}</h2>
            {chains ? (
              <DataExport chains={chains} />
            ) : (
              <button className="btn btn-outline btn-primary" disabled>
                ...
              </button>
            )}
          </div>

          <div className="sm:overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th align="left">{t("name")}</th>
                  <th align="left">{t("location")}</th>
                  <th align="center">{t("status")}</th>
                  <th align="right" />
                </tr>
              </thead>
              <tbody>
                {chains
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map((chain) => {
                    let userChain = authUser?.chains.find(
                      (uc) => uc.chain_uid === chain.uid
                    );
                    let isUserAdmin = userChain?.is_chain_admin || false;

                    return (
                      <tr key={chain.uid}>
                        <td className="font-bold w-32 whitespace-normal">
                          {chain.name}
                        </td>
                        <td align="left" className="whitespace-normal">
                          {chain.address}
                        </td>
                        <td align="center">
                          {userChain?.is_approved ||
                          (!userChain && authUser?.is_root_admin) ? (
                            chain.published ? (
                              <div className="tooltip" data-tip="published">
                                <span className="feather feather-eye  text-lg text-green" />
                              </div>
                            ) : (
                              <div className="tooltip" data-tip="draft">
                                <span className="feather feather-eye-off  text-lg text-red" />
                              </div>
                            )
                          ) : (
                            <div
                              className="tooltip"
                              data-tip={t("pendingApproval")}
                            >
                              <span className="feather btn-circle btn-lg feather-user-check text-yellow-darkest" />
                            </div>
                          )}
                        </td>
                        <td align="right">
                          <div className="flex justify-end">
                            {(isUserAdmin && userChain?.is_approved) ||
                            authUser?.is_root_admin ? (
                              <Link
                                className={`btn btn-primary justify-between w-28 ${
                                  chains?.length > 5 ? "btn-sm" : ""
                                }`}
                                to={`/loops/${chain.uid}/members`}
                              >
                                {t("view")}
                                <span className="feather feather-arrow-right ml-3"></span>
                              </Link>
                            ) : null}
                            <div className="dropdown dropdown-left">
                              <label
                                tabIndex={0}
                                className={`btn btn-ghost ${
                                  chains?.length > 5 ? "btn-sm" : ""
                                } ${userChain ? "" : "btn-disabled"}`}
                              >
                                <span className="text-xl feather feather-more-vertical" />
                              </label>
                              {userChain ? (
                                <ul
                                  tabIndex={0}
                                  className="dropdown-content menu shadow bg-base-100 w-52 h-full"
                                >
                                  <li className="h-full">
                                    <a
                                      className="h-full text-red font-bold"
                                      href="#"
                                      onClick={(e) =>
                                        handleClickUnsubscribe(e, chain)
                                      }
                                    >
                                      {userChain?.is_approved
                                        ? t("leaveLoop")
                                        : t("leaveWaitlist")}
                                    </a>
                                  </li>
                                </ul>
                              ) : null}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}