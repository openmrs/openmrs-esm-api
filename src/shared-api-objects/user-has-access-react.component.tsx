import React from "react";
import { getCurrentUser, userHasAccess } from "./current-user";

export default function UserHasAccessReact(props) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const subscription = getCurrentUser({ includeAuthStatus: false }).subscribe(
      x => {
        setUser(x);
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (user) {
    return userHasAccess(props.privilege, user) !== undefined && props.children;
  } else {
    return null;
  }
}
