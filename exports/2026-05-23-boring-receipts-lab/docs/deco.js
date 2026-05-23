// Build the vertical numeric ruler (1..9 repeating) - pure decoration.
(function(){
  var el=document.getElementById('ruler');
  if(!el) return;
  var r=[]; for(var i=0;i<70;i++){ r.push((i%9)+1); }
  el.textContent=r.join('\n');
})();
