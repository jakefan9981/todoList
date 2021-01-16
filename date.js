exports.getDate=function(){
  let today=new Date();
  let option={
    day:"numeric",
    month:"long",
    weekday:"long"
  };
  return today.toLocaleDateString("en-US",option);
};
