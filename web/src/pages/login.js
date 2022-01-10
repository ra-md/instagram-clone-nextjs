import { checkAuth } from "../utils/check-auth";
import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { TextField } from "../components/ui/text-field";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../graphql/mutation/login";
import { mapError } from "../utils/map-error";

export default function loginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading }] = useMutation(LOGIN);
  const [errors, setErrors] = useState([]);

  async function handleLogin() {
    const { data } = await login({
      variables: { emailOrUsername, password },
    });

    if (data.login.user) {
      router.push("/");
    }

    if (data.login.errors) {
      setErrors(data.login.errors);
    }
  }

  return (
    <section className="h-screen grid place-content-center">
      <Card className="grid gap-4 py-12 items-center text-center mb-4 w-84 md:w-96">
        <h1 className="text-3xl font-bold">Instagram</h1>
        <label htmlFor="email-or-username">
          <TextField
            id="email-or-username"
            placeholder="Email or username"
            type="text"
            value={emailOrUsername}
            onChange={(event) => setEmailOrUsername(event.target.value)}
          />
          <p className="text-red-500">{mapError("emailOrUsername", errors)}</p>
        </label>
        <label htmlFor="password">
          <TextField
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="text-red-500">{mapError("password", errors)}</p>
        </label>
        <Button
          disabled={emailOrUsername === "" || password === ""}
          onClick={handleLogin}
          isLoading={loading}
          className="bg-blue-500 text-white"
        >
          Login
        </Button>
      </Card>
      <Card className="text-center py-5">
        <p>
          Don&apos;t have an account?{" "}
          <NextLink href="/signup">Sign Up</NextLink>
        </p>
      </Card>
    </section>
  );
}

export const getServerSideProps = checkAuth;
