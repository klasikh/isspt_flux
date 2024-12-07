 
import {
  HomeIcon,
  UserCircleIcon,
  BellAlertIcon,
  PlusSmallIcon,
  TableCellsIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  DocumentTextIcon,
  BanknotesIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/solid";
import { Home, } from "../pages/dashboard/home";
import { Dashboard, } from "../pages/dashboard";
import { Profile, } from "../pages/profile";
import UsersList from "../pages/users/list";
import UserAdd from "../pages/users/add";
import GradesList from "../pages/grades/list";
import GradeAdd from "../pages/grades/add";
import ModulesList from "../pages/modules/list";
import ModuleAdd from "../pages/modules/add";
import FilieresList from "../pages/filieres/list";
import FiliereAdd from "../pages/filieres/add";
import MotifsList from "../pages/motifs/list";
import MotifAdd from "../pages/motifs/add";
import PaymentsList from "../pages/payments/list";
import PaymentAdd from "../pages/payments/add";
import SpentsList from "../pages/spents/list";
import SpentAdd from "../pages/spents/add";
import LogsList from "../pages/logs/list";

// import { Home, Profile, Tables, Notifications } from "../pages/dashboard";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
    {
      title: "Profils",
      layout: "dashboard",
      number: 1,
      role: "ADMIN",
      pages: [
        {
          icon: <BellAlertIcon {...icon} />,
          name: "Liste des profils",
          path: "/grades/list",
          element: <GradesList />,
        },
        {
          icon: <PlusSmallIcon {...icon} />,
          name: "Ajouter un profil",
          path: "/grades/add",
          element: <GradeAdd />,
        },
      ]
    },
    {
      title: "Modules",
      layout: "dashboard",
      number: 2,
      role: "ADMIN",
      pages: [
        {
          icon: <BellAlertIcon {...icon} />,
          name: "Liste des modules",
          path: "/modules/list",
          element: <ModulesList />,
        },
        {
          icon: <PlusSmallIcon {...icon} />,
          name: "Ajouter un module",
          path: "/modules/add",
          element: <ModuleAdd />,
        },
      ]
    },
    {
      title: "Utilisateurs",
      layout: "dashboard",
      number: 3,
      role: "ADMIN",
      pages: [
        {
          icon: <UserCircleIcon {...icon} />,
          name: "Liste des utilisateurs",
          path: "/users/list",
          element: <UsersList />,
        },
        {
          icon: <PlusSmallIcon {...icon} />,
          name: "Ajouter un utilisateur",
          path: "/users/add",
          element: <UserAdd />,
        },
      ]
    },
    {
      title: "Filières",
      layout: "dashboard",
      number: 4,
      role: "ADMIN",
      pages: [
        {
          icon: <UserCircleIcon {...icon} />,
          name: "Liste des filières",
          path: "/filieres/list",
          element: <FilieresList />,
        },
        {
          icon: <PlusSmallIcon {...icon} />,
          name: "Ajouter une filière",
          path: "/filieres/add",
          element: <FiliereAdd />,
        },
      ]
    },
    {
      title: "Motifs",
      layout: "dashboard",
      number: 5,
      role: "ADMIN",
      pages: [
        {
          icon: <UserCircleIcon {...icon} />,
          name: "Liste des motifs",
          path: "/motifs/list",
          element: <MotifsList />,
        },
        {
          icon: <PlusSmallIcon {...icon} />,
          name: "Ajouter un motif",
          path: "/motifs/add",
          element: <MotifAdd />,
        },
      ]
    },
    {
      title: "Paiement",
      layout: "dashboard",
      number: 6,
      role: "ADMIN",
      pages: [
        {
          icon: <DocumentTextIcon {...icon} />,
          name: "Liste des paiements",
          path: "/payments/list",
          element: <PaymentsList />,
          module: "PAYMENT"
        },
        {
          icon: <PlusSmallIcon {...icon} />,
          name: "Ajouter un paiement",
          path: "/payments/add",
          element: <PaymentAdd />,
          module: "PAYMENT"
        },
      ]
    },
    {
      title: "Dépense",
      layout: "dashboard",
      number: 7,
      role: "ADMIN",
      pages: [
        {
          icon: <BanknotesIcon {...icon} />,
          name: "Liste des dépenses",
          path: "/spents/list",
          element: <SpentsList />,
          module:"SPENT"
        },
        {
          icon: <PlusSmallIcon {...icon} />,
          name: "Ajouter une dépense",
          path: "/spents/add",
          element: <SpentAdd />,
          module:"SPENT"
        },
      ]
    },

    // USER BUTTONS
  /* {
    title: "Paiement",
    layout: "dashboard",
    number: 8,
    role: "USER",
    pages: [
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "Liste des paiements",
        path: "/payments/list",
        element: <PaymentsList />,
        module: "PAYMENT"
      },
      {
        icon: <PlusSmallIcon {...icon} />,
        name: "Ajouter un paiement",
        path: "/payments/add",
        element: <PaymentAdd />,
        module: "PAYMENT"
      },
    ]
  },
  {
    title: "Dépense",
    layout: "dashboard",
    number: 9,
    role: "USER",
    pages: [
      {
        icon: <BanknotesIcon {...icon} />,
        name: "Liste des dépenses",
        path: "/spents/list",
        element: <SpentsList />,
        module:"SPENT"
      },
      {
        icon: <PlusSmallIcon {...icon} />,
        name: "Ajouter une dépense",
        path: "/spents/add",
        element: <SpentAdd />,
        module:"SPENT"
      },
    ]
  }, */
  {
    title: "Logs",
    layout: "dashboard",
    number: 10,
    role: "ADMIN",
    pages: [
      {
        icon: <AdjustmentsHorizontalIcon {...icon} />,
        name: "Liste des logs",
        path: "/logs/list",
        element: <LogsList />,
      },
    ]
  },
];

export default routes;
