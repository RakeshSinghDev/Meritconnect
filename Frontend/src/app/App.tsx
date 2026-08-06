import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "../store/AuthContext";
import { router } from "./router";

const App = () => {
    return (
        <AuthProvider>
            <RouterProvider
                router={router}
            />
        </AuthProvider>
    );
};

export default App;