import { Navbar, Container } from "react-bootstrap";

const Header = () => {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#home">
          Learning-based Multi-view 3D Model Reconstruction
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default Header;
