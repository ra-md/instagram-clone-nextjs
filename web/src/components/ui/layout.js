import { Header } from "../ui/header";
import { Container } from "./container";

export function Layout({ children }) {
  return (
    <>
      <Header />
      <Container>
        <div className="my-6">{children}</div>
      </Container>
    </>
  );
}
