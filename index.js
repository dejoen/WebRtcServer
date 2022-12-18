const http=require("http")
const Socket=require("websocket").server
const  server=http.createServer(()=>{})
server.listen(3000,()=>{
 console.log("server started")
})

const users=[]
const webSocket=new Socket({httpServer:server})

webSocket.on('request',(req)=>{
 const connection= req.accept()
 //console.log(connection)
connection.on('message',(message)=>{
     const data=JSON.parse(message.utf8Data)
     console.log(data)
   const user=  findUser(data.name)
     switch(data.type){
          case "store_user":
               if(user!=null){
               connection.send(JSON.stringify({type:"user already exist"}))
               return
               }

               const newUser={
                    name:data.name,conn:connection
               }
               users.push(newUser)
          break
          case "start_call":
         const usertoCall=findUser(data.target)
         if(usertoCall){
          connection.send(JSON.stringify({
               type:"call_response", data:"user ready to call"
          }))
         }else{
          connection.send(JSON.stringify({
               type:"call_response", data:"user not online"
          }))
         }
          break

          case "create_offer":
           const userToReceiveOffer =findUser(data.target)  
           if(userToReceiveOffer){
               userToReceiveOffer.conn.send(JSON.stringify({
                    type:"offer received",
                    name:data.name,
                    data:data.data.sdp
               }))
           }
           break
           case "create_answer":
      const userToReceiveAnswer=findUser(data.target)
      if(userToReceiveAnswer){
          userToReceiveAnswer.conn.send(JSON.stringify({
               type:"answer recieved",
               name:data.name,
               data:data.data.sdp
          }))
      }
           break

           case "ice_candidate":
           const userToReceiveIceCandidate=findUser(data.target)
           if(userToReceiveIceCandidate){
               userToReceiveIceCandidate.conn.send(JSON.stringify({
                    type:"ice candidate",
                    name:data.name,
                    data:{
                         sdpMlineIndex:data.data.sdpMlineIndex,
                         sdpMid:data.data.sdpMid,
                         sdpCandidate:data.data.sdpCandidate
                    }

               }))
           }
           break
     }
})

connection.on('close',()=>{
   users.forEach(user=>{
     if(user.conn===connection){
          users.splice(users.indexOf(user),1)
     }
   })
})
})

const findUser= username=>{
 for(let i=0;i<users.length;i++)
 if(users[i].name===username)
 return users[i]  
}