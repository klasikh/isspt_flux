/* eslint-disable */
import type { Prisma, User, UserModulePriority, Link, Module, Service, Grade, Filiere, Motif, Payment, Spent, LogInfo } from "@prisma/client";
export default interface PrismaTypes {
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        RelationName: "bookmarks" | "payments" | "spents" | "userModulesPriorities" | "grade";
        ListRelations: "bookmarks" | "payments" | "spents" | "userModulesPriorities";
        Relations: {
            bookmarks: {
                Shape: Link[];
                Types: PrismaTypes["Link"];
            };
            payments: {
                Shape: Payment[];
                Types: PrismaTypes["Payment"];
            };
            spents: {
                Shape: Spent[];
                Types: PrismaTypes["Spent"];
            };
            userModulesPriorities: {
                Shape: UserModulePriority[];
                Types: PrismaTypes["UserModulePriority"];
            };
            grade: {
                Shape: Grade;
                Types: PrismaTypes["Grade"];
            };
        };
    };
    UserModulePriority: {
        Name: "UserModulePriority";
        Shape: UserModulePriority;
        Include: Prisma.UserModulePriorityInclude;
        Select: Prisma.UserModulePrioritySelect;
        OrderBy: Prisma.UserModulePriorityOrderByWithRelationInput;
        WhereUnique: Prisma.UserModulePriorityWhereUniqueInput;
        Where: Prisma.UserModulePriorityWhereInput;
        RelationName: "user" | "module";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Types: PrismaTypes["User"];
            };
            module: {
                Shape: Module;
                Types: PrismaTypes["Module"];
            };
        };
    };
    Link: {
        Name: "Link";
        Shape: Link;
        Include: Prisma.LinkInclude;
        Select: Prisma.LinkSelect;
        OrderBy: Prisma.LinkOrderByWithRelationInput;
        WhereUnique: Prisma.LinkWhereUniqueInput;
        Where: Prisma.LinkWhereInput;
        RelationName: "users";
        ListRelations: "users";
        Relations: {
            users: {
                Shape: User[];
                Types: PrismaTypes["User"];
            };
        };
    };
    Module: {
        Name: "Module";
        Shape: Module;
        Include: Prisma.ModuleInclude;
        Select: Prisma.ModuleSelect;
        OrderBy: Prisma.ModuleOrderByWithRelationInput;
        WhereUnique: Prisma.ModuleWhereUniqueInput;
        Where: Prisma.ModuleWhereInput;
        RelationName: "userModulesPriorities";
        ListRelations: "userModulesPriorities";
        Relations: {
            userModulesPriorities: {
                Shape: UserModulePriority[];
                Types: PrismaTypes["UserModulePriority"];
            };
        };
    };
    Service: {
        Name: "Service";
        Shape: Service;
        Include: never;
        Select: Prisma.ServiceSelect;
        OrderBy: Prisma.ServiceOrderByWithRelationInput;
        WhereUnique: Prisma.ServiceWhereUniqueInput;
        Where: Prisma.ServiceWhereInput;
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Grade: {
        Name: "Grade";
        Shape: Grade;
        Include: Prisma.GradeInclude;
        Select: Prisma.GradeSelect;
        OrderBy: Prisma.GradeOrderByWithRelationInput;
        WhereUnique: Prisma.GradeWhereUniqueInput;
        Where: Prisma.GradeWhereInput;
        RelationName: "users";
        ListRelations: "users";
        Relations: {
            users: {
                Shape: User[];
                Types: PrismaTypes["User"];
            };
        };
    };
    Filiere: {
        Name: "Filiere";
        Shape: Filiere;
        Include: Prisma.FiliereInclude;
        Select: Prisma.FiliereSelect;
        OrderBy: Prisma.FiliereOrderByWithRelationInput;
        WhereUnique: Prisma.FiliereWhereUniqueInput;
        Where: Prisma.FiliereWhereInput;
        RelationName: "payments";
        ListRelations: "payments";
        Relations: {
            payments: {
                Shape: Payment[];
                Types: PrismaTypes["Payment"];
            };
        };
    };
    Motif: {
        Name: "Motif";
        Shape: Motif;
        Include: Prisma.MotifInclude;
        Select: Prisma.MotifSelect;
        OrderBy: Prisma.MotifOrderByWithRelationInput;
        WhereUnique: Prisma.MotifWhereUniqueInput;
        Where: Prisma.MotifWhereInput;
        RelationName: "payments";
        ListRelations: "payments";
        Relations: {
            payments: {
                Shape: Payment[];
                Types: PrismaTypes["Payment"];
            };
        };
    };
    Payment: {
        Name: "Payment";
        Shape: Payment;
        Include: Prisma.PaymentInclude;
        Select: Prisma.PaymentSelect;
        OrderBy: Prisma.PaymentOrderByWithRelationInput;
        WhereUnique: Prisma.PaymentWhereUniqueInput;
        Where: Prisma.PaymentWhereInput;
        RelationName: "filiere" | "motif" | "user";
        ListRelations: never;
        Relations: {
            filiere: {
                Shape: Filiere;
                Types: PrismaTypes["Filiere"];
            };
            motif: {
                Shape: Motif;
                Types: PrismaTypes["Motif"];
            };
            user: {
                Shape: User;
                Types: PrismaTypes["User"];
            };
        };
    };
    Spent: {
        Name: "Spent";
        Shape: Spent;
        Include: Prisma.SpentInclude;
        Select: Prisma.SpentSelect;
        OrderBy: Prisma.SpentOrderByWithRelationInput;
        WhereUnique: Prisma.SpentWhereUniqueInput;
        Where: Prisma.SpentWhereInput;
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Types: PrismaTypes["User"];
            };
        };
    };
    LogInfo: {
        Name: "LogInfo";
        Shape: LogInfo;
        Include: never;
        Select: Prisma.LogInfoSelect;
        OrderBy: Prisma.LogInfoOrderByWithRelationInput;
        WhereUnique: Prisma.LogInfoWhereUniqueInput;
        Where: Prisma.LogInfoWhereInput;
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
}