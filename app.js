//Server create krna hai aur html file ko serve krna hai
import { createServer } from "http";
import { readFile, writeFile} from "fs/promises";
import crypto from "crypto";
import path from "path";

const PORT = process.env.PORT|| 3000;




const serveFile = async (res, filePath, contentType) => {
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { "Content-Type": contentType });
    res.end("404 page not found");
  }
};
//function of getting duplicate data.
const DATA_FILE=path.join("data","links.json");
const loadLinks=async()=>{
    
    
    try {
    const data = await readFile(DATA_FILE, "utf-8");
    // Check if the file is empty
    if (data.trim() === "") {
      console.warn("links.json is empty. Initializing with an empty object.");
      await writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    return JSON.parse(data);
  }
    
    
    catch(error){
      if(error.code=== "ENOENT"){
        await writeFile(DATA_FILE,JSON.stringify({}))
        return {};
      }
      throw error;
    }
  }
  const saveLinks=async(links)=>{
    await writeFile(DATA_FILE,JSON.stringify(links,));
  };



//GET: frontend se user koi request bhejta hai to usko handle krna hota hai 
const server =   createServer(async (req, res) => {

  if (req.method === "GET") {
    if (req.url === "/") {
      return serveFile(res, path.join("public", "index.html"), "text/html");
    } else if (req.url === "/style.css") {
      return serveFile(res, path.join("public", "style.css"), "text/css");
    }
    else if(req.url==="/links"){
        const links = await loadLinks();

        res.writeHead(200,{"Content-Type": "application/json"});
        return res.end(JSON.stringify(links));
    }else{
        const links=await loadLinks();
        const shortCode=req.url.slice(1);
        console.log("links red",req.url);
        if(links[shortCode]){
            res.writeHead(302,{location:links[shortCode]});
            return res.end();
        }

    }
    res.writeHead(404,{"Content-Type":"text/plain"});
    return res.end("Shortened URL is not found");


  
  }





//POST :frontend se data aayega to usko handle krna hai
if(req.method==="POST"&&req.url==="/shorten"){
  console.log("POST received");
  //checking dulicate data
  const links = await loadLinks();

    let body="";
    req.on("data",(chunk)=>{
        body=body+chunk;
    });
    req.on("end",async ()=>{
        console.log(body);
        const {url,shortCode}=JSON.parse(body);
        if(!url){
            res.writeHead(400,{"Content-Type":"text/plain"});
            return res.end("URL is  required");
        }

        const finalShortCode =  shortCode || crypto.randomBytes(4).toString("hex");
        
        //checking duplicate data
        //if shortCode already exists then give 400 error and say short code already esists

        if(links[finalShortCode]){
          res.writeHead(400,{"Content-Type":"text/plain"});
          return res.end("Short Code already exists. Please choose another one");

        }
        links[finalShortCode]=url;
        await saveLinks(links);

        res.writeHead(200,{"Content-Type":"application/json"});
        res.end(JSON.stringify({success:true,shortCode:finalShortCode}));

    })
}



});
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
