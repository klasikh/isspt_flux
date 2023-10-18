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

export const schema = builder.toSchema()
