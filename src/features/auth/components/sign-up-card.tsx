"use client";

import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema } from "../schemas";
import { useRegister } from "../api/mutations/use-register";

export function SignUpCard() {
  const { mutate: register } = useRegister();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    register({ json: data });
  };

  return (
    <Card className="w-full h-full border-none shadow-none md:w-[487px]">
      <CardHeader className="flex flex-col items-center justify-center p-7 text-center gap-y-2">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          By signing up, you agree to our{" "}
          <Link href="/privacy" className="underline">
            <span className="text-blue-700">Privacy Policy</span>
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="underline">
            <span className="text-blue-700">Terms of Service</span>
          </Link>
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
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
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter your password"
                      min={8}
                      max={256}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full" disabled={false}>
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="flex flex-col gap-y-4 p-7">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={false}
        >
          <FcGoogle className="w-4 h-4 mr-2" />
          Sign in with Google
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={false}
        >
          <FaGithub className="w-4 h-4 mr-2" />
          Sign in with Github
        </Button>
      </CardContent>
      <div className="px-7">
        <DottedSeparator />
        <CardContent className="flex items-center justify-center p-7">
          <p className="text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary-500">
              <span className="text-blue-700">Sign in</span>
            </Link>
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
