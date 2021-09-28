// Material
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";
import Button from "@material-ui/core/Button";

//Plugins
import { useState } from "react";
import { Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

// Project resources
import AppIcon from "../images/clothing-loop.png";
import { TextForm, TextArea } from "../components/FormFields";
import Footer from "../components/Footer";

const Contacts = () => {
  const classes = makeStyles(theme);
  const { t } = useTranslation();
  const [error, setError] = useState();
  const [submitted, setSubmitted] = useState(false);

  const validate = Yup.object({
    name: Yup.string()
      .min(2, "Must be more than 2 characters")
      .required("Required"),
    email: Yup.string().email("Please enter a valid e-mail address"),
    message: Yup.string().min(2, "Must be more than 2 characters"),
  });

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Contacts</title>
        <meta name="description" content="Contacts" />
      </Helmet>
      <Grid container>
        <Grid item sm />
        <Grid item sm>
          <div className={"text-wrapper"}>
            <img src={AppIcon} alt="SFM logo" width="500" />
            <Typography>
              For all enquiries about The Clothing Loop project, please get in
              touch with us using the form below. We will get back to you as
              soon as possible.
            </Typography>

            <Formik
              initialValues={{
                name: "",
                email: "",
                message: "",
              }}
              validationSchema={validate}
              onSubmit={(v) => console.log(v)}
            >
              {(formik) => (
                <Form className="contact-form">
                  <TextForm
                    label="Name"
                    name="name"
                    type="text"
                    className={classes.textField}
                    required
                  />
                  <TextForm
                    label="Email"
                    name="email"
                    type="text"
                    className={classes.textField}
                    required
                  />
                  <TextArea
                    label="Message"
                    name="message"
                    type="text"
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.button}
                  >
                    {t("submit")}
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
          <Footer />
        </Grid>
        <Grid item sm />
      </Grid>
    </>
  );
};

export default Contacts;