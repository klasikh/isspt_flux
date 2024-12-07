// graphql/schema.ts

import { builder } from "./builder";
import "./types/Link"
import "./types/Grade"
import "./types/Filiere"
import "./types/Service"
import "./types/User"
import "./types/Motif"
import "./types/Module"
import "./types/UserModulePriority"
import "./types/Payment"
import "./types/Spent"
import "./types/LogInfo"
// import { writeFileSync } from 'fs'
// import { resolve } from 'path'
// import { printSchema } from 'graphql'

export const schema = builder.toSchema({})

// writeFileSync(resolve(__dirname, './schema.graphql'), printSchema(schema))
// open a terminal and give me a read write access
// It's done, freezing where is your prisma:generate and prisma:push commands
// In the following folder "./prisma/schema.prisma", no i mean commands like npx prisma push
// I don't understand, nvm, look at graphql/types/fliere :88
//Yes I seen, are you seeing a freeze and lags, Yes I noticed too
// How to fix the bug ? looks like a connection error, save all files close and kill session, and send me a new link
// Okay 
