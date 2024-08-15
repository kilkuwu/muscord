import { Context } from "hono"
import E from "./Env"

type MyContext = Context<E, any, {}>;

export default MyContext;