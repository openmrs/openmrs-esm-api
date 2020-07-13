import React from "react";
import { getCurrentUser, userHasAccess } from "./current-user";

export interface UserHasAccessReactProps {
  privilege: string;
}

const UserHasAccessReact: React.FC<UserHasAccessReactProps> = props => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const subscription = getCurrentUser({
      includeAuthStatus: false
    }).subscribe((x: any) => setUser(x));
    return () => subscription.unsubscribe();
  }, []);

  if (user && userHasAccess(props.privilege, user)) {
    return <>{props.children}</>;
  }

  return null;
};

export default UserHasAccessReact;
