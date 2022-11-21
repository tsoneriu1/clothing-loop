import { useState, useEffect, useMemo, FormEvent } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import SizesDropdown from "../components/SizesDropdown";
import { TextForm } from "../components/FormFields";
import categories from "../util/categories";
import GeocoderSelector from "../components/GeocoderSelector";
import { UID, User } from "../api/types";
import { userGetByUID, userUpdate } from "../api/user";
import { PhoneFormField } from "../components/FormFields";
import useForm from "../util/form.hooks";

interface Params {
  userUID: UID;
}

interface State {
  chainUID: UID;
}

export default function UserEdit() {
  const { t } = useTranslation();
  const history = useHistory();
  const state = useLocation<State>().state;

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [values, setValue, setValues] = useForm({
    name: "",
    phone: "",
    sizes: [] as string[],
    address: "",
    newsletter: false,
  });

  const [user, setUser] = useState<User>();
  const params = useParams<Params>();

  const userIsChainAdmin = useMemo(
    () =>
      user?.chains.find((c) => c.chain_uid == state.chainUID)?.is_chain_admin ||
      false,
    [user]
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    (async () => {
      try {
        await userUpdate({
          name: values.name,
          phone_number: values.phone,
          newsletter: values.newsletter,
          address: values.address,
          sizes: values.sizes,
        });
        setSubmitted(true);
        setTimeout(() => {
          history.goBack();
        }, 1200);
      } catch (e: any) {
        console.error(`Error updating user: ${JSON.stringify(e)}`);
        setError(e?.data || `Error: ${JSON.stringify(e)}`);
      }
    })();
  }

  useEffect(() => {
    (async () => {
      try {
        const user = (await userGetByUID(state.chainUID, params.userUID)).data;
        setUser(user);
        setValues({
          name: user.name,
          phone: user.phone_number,
          sizes: user.sizes,
          address: user.address,
          newsletter: false,
        });
      } catch (error) {
        console.warn(error);
      }
    })();
  }, [history]);

  return !user ? null : (
    <>
      <Helmet>
        <title>The Clothing Loop | Edit user</title>
        <meta name="description" content="Edit user" />
      </Helmet>
      <div className="tw-w-full tw-container sm:tw-max-w-screen-md tw-mx-auto tw-p-10">
        <h1 className="tw-font-serif tw-font-bold tw-text-6xl tw-text-secondary tw-mb-4">
          {user.is_root_admin || userIsChainAdmin
            ? t("editAdminContacts")
            : t("editParticipantContacts")}
        </h1>
        <form onSubmit={onSubmit} className="tw-relative">
          <div className="tw-max-w-xs">
            <TextForm
              type="text"
              label={t("name")}
              name="name"
              required
              className="tw-w-full tw-mb-2"
              min={2}
              value={values.name}
              onChange={(e: any) => setValue("name", e.target.value)}
            />

            <PhoneFormField classes={{ root: "tw-w-full tw-mb-4" }} />

            <SizesDropdown
              filteredGenders={Object.keys(categories)}
              selectedSizes={values.sizes || []}
              className="tw-w-full tw-mb-4"
              handleChange={(v) => setValue("sizes", v)}
            />

            <div className="tw-absolute tw-top-0 tw-right-0 tw-w-[calc(100%_-_352px)] tw-aspect-[4/3]">
              <GeocoderSelector
                address={values.address}
                onResult={(e: any) => setValue("address", e.result.place_name)}
              />
            </div>

            <div className="tw-form-control tw-mb-4">
              <label className="tw-label tw-cursor-pointer">
                <span className="tw-label-text">
                  {t("newsletterSubscription")}
                </span>
                <input
                  type="checkbox"
                  className="tw-checkbox"
                  name="newsletter"
                />
              </label>
            </div>

            <div className="tw-flex">
              <button
                type="button"
                onClick={() => history.goBack()}
                className="tw-btn tw-btn-primary tw-btn-outline"
              >
                {t("back")}
              </button>

              <button type="submit" className="tw-btn tw-btn-secondary tw-ml-3">
                {t("submit")}
                <span className="feather feather-arrow-right tw-ml-4"></span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
