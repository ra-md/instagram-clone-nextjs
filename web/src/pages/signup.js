import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { TextField } from "../components/ui/text-field";
import { useMutation } from "@apollo/client";
import { SIGNUP } from "../graphql/mutation/signup";
import { mapError } from "../utils/map-error";
import { checkAuth } from "../utils/check-auth";

export default function signUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [register, { loading }] = useMutation(SIGNUP);
  const [errors, setErrors] = useState([]);

  async function handleSignUp() {
    const { data } = await register({
      variables: { name, username, email, password },
    });

    if (data.register.user) {
      router.push("/");
    }

    if (data.register.errors) {
      setErrors(data.register.errors);
    }
  }

  return (
    <section className="h-screen grid place-content-center">
      <Card className="grid gap-4 py-12 items-center text-center mb-4 w-84 md:w-96">
        <h1 className="text-3xl font-bold">Instagram</h1>
        <label htmlFor="email">
          <TextField
            id="email"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <p className="text-red-500">{mapError("email", errors)}</p>
        </label>
        <label htmlFor="name">
          <TextField
            id="name"
            placeholder="Name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <p className="text-red-500">{mapError("name", errors)}</p>
        </label>
        <label htmlFor="username">
          <TextField
            id="username"
            placeholder="Username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <p className="text-red-500">{mapError("username", errors)}</p>
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
          disabled={email === "" || password === ""}
          onClick={handleSignUp}
          isLoading={loading}
          className="bg-blue-500 text-white"
        >
          Signup
        </Button>
      </Card>
      <Card className="text-center py-5">
        <p>
          Have an account? <NextLink href="/login">Log In</NextLink>
        </p>
      </Card>
    </section>
  );
}

export const getServerSideProps = checkAuth;
