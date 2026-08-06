import { NavigationTree } from "@/@types/navigation";

export const leadMaster: NavigationTree = {
    id: "leadMaster",
    type: "collapse", 
    path: "/lead-master",
    title: "Lead Master",
    icon: "leadMaster",
    childs: [
        {
            id: "leadMaster.enquiry",
            type: "item",
            path: "/lead-master/enquiry",
            title: "Create Enquiry ",
            icon: "enquiry.list",
        },
        {
            id: "leadMaster.quotation",
            type: "item",
            path: "/lead-master/quotation",
            title: "Quotation",
            icon: "quotation.list",
        },
    ],
};