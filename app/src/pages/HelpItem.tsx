import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonText,
  IonPage,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TOptionsBase } from "i18next";
import { RouteComponentProps } from "react-router";
import { StoreContext } from "../Store";

export interface FaqListItem {
  title: string;
  content: string;
}

export const faqListKeys = [
  "whereAreTheBags",
  "max3Days",
  "whatIsInTheBag",
  "whoDoIGiveTheBagTo",
  "whatToDoWithBulkyItems",
  "awayOrBusy",
  "foundSomethingYouLike",
  "privacy",
  "newMembers",
  "feedback",
];

export const faqItemTranslationOption: TOptionsBase = {
  ns: "faq",
  returnObjects: true,
  defaultValue: {
    title: "🔴 Error",
    content: "Translation not found",
  },
};

export default function HelpItem({
  match,
}: RouteComponentProps<{ index: string }>) {
  const { t } = useTranslation();
  const { chain } = useContext(StoreContext);

  const item = useMemo<FaqListItem>(() => {
    let index = parseInt(match.params.index, 10);

    if (chain && chain.rules_override) {
      const json = JSON.parse(chain.rules_override);
      return json[index] || faqItemTranslationOption.defaultValue;
    }

    return t(faqListKeys[index], faqItemTranslationOption);
  }, [match.params.index, chain]);

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton>{t("back")}</IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText>
          <h1 style={{ marginTop: 0, fontSize: 30, fontWeight: "bold" }}>
            {item.title}
          </h1>
          {item.content.split("\n").map((s, i) => (
            <p key={i}>{s}</p>
          ))}
        </IonText>
      </IonContent>
    </IonPage>
  );
}
