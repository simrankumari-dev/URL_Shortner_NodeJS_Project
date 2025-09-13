//Server create krna hai aur html file ko serve krna hai
import {createServer} from "http";
import {readFile} from "fs/promises";

import path from "path";
const PORT=3002;
const server=createServer(async (req,res)=>{
    console.log(req.url);
    if(req.method==="Get"){
        if(req.url==="/"){
            try{
                const data= await readFile(path.join("public","index.html"));
                res.writeHead(200,{'Content-Type':"text/html"});
                res.end(data);
            }
            catch(error){
                res.writeHead(404,{'Content-Type':"text/html"});
                res.end("404 page not found");
                }

            }

        }
    });
    server.listen(PORT,()=>{
        console.group(`Server is running at http://localhost:${PORT}`);
    });
