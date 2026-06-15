import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStoreBase } from "@/store/store"; // أو أي مسار صحيح
interface StoreState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
}
const GoogleOAuthFailure = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setAccessToken = useStoreBase((state: StoreState) => state.setAccessToken);

  const accessToken = params.get("access_token");
  const status = params.get("status");

  React.useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
      navigate("/");
    }
  }, [accessToken, setAccessToken, navigate]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <Logo noLink />
          Standing Together.
        </Link>
      </div>

      <Card>
        <CardContent>
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            {status === "failure" ? (
              <>
                <h1>Authentication Failed</h1>
                <p>We couldn't sign you in with Google. Please try again.</p>
              </>
            ) : (
              <h1>Logging in...</h1>
            )}
            <Button onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleOAuthFailure;
