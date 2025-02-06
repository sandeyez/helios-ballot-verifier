import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
  useLocation,
  useMatches,
} from "@remix-run/react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./components/ui/navigation-menu";
import GlobalSettingsContextProvider from "./contexts/GlobalSettingsContext";
import "./tailwind.css";
import { ErrorPage } from "./components/ErrorPage";
import { Toaster } from "./components/ui/toaster";

type LoaderData = {
  ballotLength: number;
};

export async function loader() {
  const ballotLength = Number(process.env.BALLOT_LENGTH);

  if (!ballotLength || isNaN(ballotLength)) {
    throw new Error("Ballot length not set");
  }

  return {
    ballotLength,
  };
}

export default function App() {
  const { pathname } = useLocation();
  const { ballotLength } = useLoaderData<typeof loader>();

  const navigationItems: {
    label: string;
    href: string;
  }[] = [
    {
      label: "Merkle Tree",
      href: "/merkle-tree",
    },
    {
      label: "Radix Tree",
      href: "/radix-tree",
    },
  ];

  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body className="gap-4 max-w-[100dvw] h-screen w-screen max-h-svh overflow-auto flex flex-col">
        <GlobalSettingsContextProvider initialBallotLength={ballotLength}>
          <nav className="flex items-center py-2 px-8">
            <Link className="text-lg font-bold mr-8" to={"/"}>
              Helios Ballot Verifier
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map(({ href, label }) => (
                  <NavigationMenuItem key={href}>
                    <NavigationMenuLink
                      active={pathname === href}
                      className={navigationMenuTriggerStyle()}
                      href={href}
                    >
                      {label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
          <div className="w-full h-full flex-grow">
            <Outlet />
          </div>
          <Toaster />
        </GlobalSettingsContextProvider>
        <Scripts />
      </body>
    </html>
  );
}
