import React, { useEffect, useState } from "react";
import {
  LoginButton,
  LogoutButton,
  Text,
  useSession,
  CombinedDataProvider,
} from "@inrupt/solid-ui-react";
import { getSolidDataset, getUrlAll, getThing } from "@inrupt/solid-client";
import AddTodo from "../src/components/AddTodo";
import TodoList from "../src/components/TodoList"; // Assuming you have a TodoList component
import { getOrCreateTodoList } from "../src/utils"; // Assuming you have this utility

const STORAGE_PREDICATE = "http://www.w3.org/ns/pim/space#storage";
const authOptions = {
  clientName: "Solid Todo App",
};

function App() {
  const { session } = useSession();
  const [todoList, setTodoList] = useState();
  const [oidcIssuer, setOidcIssuer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    setOidcIssuer(event.target.value);
  };

  useEffect(() => {
    if (!session || !session.info.isLoggedIn) return;

    (async () => {
      try {
        const profileDataset = await getSolidDataset(session.info.webId, {
          fetch: session.fetch,
        });
        const profileThing = getThing(profileDataset, session.info.webId);
        const podsUrls = getUrlAll(profileThing, STORAGE_PREDICATE);
        const pod = podsUrls[0];
        const containerUri = `${pod}todos/`;
        const list = await getOrCreateTodoList(containerUri, session.fetch);
        setTodoList(list);
      } catch (error) {
        setErrorMessage("Failed to load to-do list.");
        console.error("Error fetching to-do list: ", error);
      }
    })();
  }, [session, session.info.isLoggedIn]);

  return (
    <div className="app-container">
      {session.info.isLoggedIn ? (
        <CombinedDataProvider
          datasetUrl={session.info.webId}
          thingUrl={session.info.webId}
        >
          <div className="message logged-in">
            <span>You are logged in as: </span>
            <Text
              properties={[
                "http://xmlns.com/foaf/0.1/name",
                "http://www.w3.org/2006/vcard/ns#fn",
              ]}
            />
            <LogoutButton />
          </div>
          <section>
            {/* Pass the todoList and setTodoList as props */}
            <AddTodo todoList={todoList} setTodoList={setTodoList} />
            {/* Render the TodoList component if you have one */}
            <TodoList todoList={todoList} setTodoList={setTodoList} />
          </section>
        </CombinedDataProvider>
      ) : (
        <div className="message">
          <span>You are not logged in. </span>
          <span>
            Log in with:
            <input
              className="oidc-issuer-input"
              type="text"
              name="oidcIssuer"
              list="providers"
              value={oidcIssuer}
              onChange={handleChange}
              placeholder="Enter OIDC issuer URL"
            />
            <datalist id="providers">
              <option value="https://broker.pod.inrupt.com/" />
              <option value="https://inrupt.net/" />
            </datalist>
          </span>
          <LoginButton
            oidcIssuer={oidcIssuer}
            redirectUrl={window.location.href}
            authOptions={authOptions}
            disabled={!oidcIssuer} // Disable login button if no OIDC issuer is entered
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
