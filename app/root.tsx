import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
  useLocation,
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
      label: "Local playground",
      href: "/generate-tree",
    },
    {
      label: "Simulate real-world behaviour",
      href: "/simulate",
    },
  ];

  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body className="p-2">
        <GlobalSettingsContextProvider initialBallotLength={ballotLength}>
          <div className="w-screen flex items-center justify-center">
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
          </div>
          <div className="p-4">
            <Outlet />
          </div>
        </GlobalSettingsContextProvider>
        <Scripts />
      </body>
    </html>
  );
}
