import { NavigationTree } from "@/@types/navigation";

export const employee: NavigationTree = {
    id: "employee",
    type: "collapse", 
    path: "/employee",
    title: "Employee",
    icon: "userMaster",
    childs: [
        {
            id: "employee.employeelist",
            type: "item",
            path: "/employee/employeelist",
            title: "Employee List ",
            icon: "employeelist.list",
        },
        {
            id: "employee.employeeRegister",
            type: "item",
            path: "/employee/employeeRegister",
            title: "Employee Register",
            icon: "employeeRegister.list",
        },
          {
            id: "employee.attandence",
            type: "item",
            path: "/employee/attandence",
            title: "Attandence Register",
            icon: "employeeRegister.list",
        },
    ],
};