import { Argv } from "koishi";
import Data from "../Data";
import gtnhPage from "../Page";



async function getHeadPoster(argv:Argv,message:string) {
    const baseData = Data.baseData
    const logger = baseData.logger
    
    const info = await gtnhPage.homeController.getHeadePost()

    const messageStruct = <message>
        <img src={'data:image/png;base64,'+info.logo.toString('base64')}/>
        {info.text.join('\n')}
    </message>

    await argv.session.send(messageStruct)
}

export default getHeadPoster