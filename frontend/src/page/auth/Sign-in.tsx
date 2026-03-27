import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import GoogleOauthButton from "@/components/auth/google-oauth-button";
import { useMutation } from "@tanstack/react-query";
import { loginMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useStoreBase } from "@/store/store";

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const { setAccessToken } = useStoreBase.getState();

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  const formSchema = z.object({
    email: z.string().trim().email("Invalid email address").min(1, {
      message: "Email is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    mutate(values, {
      onSuccess: (data) => {
        const accessToken = data.access_token;
        const user = data.user;
        setAccessToken(accessToken);
        const decodedUrl = returnUrl ? decodeURIComponent(returnUrl) : null;
        navigate(decodedUrl || `/workspace/${user.currentWorkspace}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white drop-shadow">
            <Logo />
            <span>Standing Together</span>
          </Link>
        </div>

        <Card className="shadow-2xl border-0 rounded-3xl bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold text-indigo-600 dark:text-purple-400">
              Welcome Back jury day
            <h1>Hello  man </h1>
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
              Login with your email or Google account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <GoogleOauthButton label="Continue with Google" />

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <span className="relative bg-white dark:bg-gray-900 px-3 text-sm text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                          <a href="#" className="text-sm text-indigo-600 dark:text-purple-400 hover:underline">
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-md"
                  disabled={isPending}
                >
                  {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Don’t have an account?{' '}
                  <Link to="/sign-up" className="text-indigo-600 dark:text-purple-400 hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-100 dark:text-gray-400">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-yellow-200">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-yellow-200">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
};

export default SignIn;