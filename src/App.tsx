import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const App = () => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <header>
            <h1>Blog Platform</h1>
            <div>
              <span>{user?.signInDetails?.loginId}</span>
              <button onClick={signOut}>Sign out</button>
            </div>
          </header>
          <section>
            <p>Welcome, {user?.signInDetails?.loginId}!</p>
          </section>
        </main>
      )}
    </Authenticator>
  );
};

export default App;
