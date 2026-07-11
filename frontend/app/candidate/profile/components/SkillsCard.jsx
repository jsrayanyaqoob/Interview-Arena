import { Award, Plus } from "lucide-react";


export default function SkillsCard({
  skills = []
}) {


return (

<div
className="
p-6

rounded-3xl

bg-white/80

dark:bg-slate-900/70

border

border-slate-200

dark:border-slate-700

shadow-xl
"
>


<div
className="
flex
justify-between
items-center
mb-5
"
>

<div
className="
flex
items-center
gap-2
"
>

<Award
className="text-indigo-500"
/>


<h3
className="
text-xl
font-semibold

text-slate-900

dark:text-white
"
>

Skills

</h3>


</div>



<button
className="
p-2

rounded-xl

bg-indigo-100

dark:bg-indigo-950

text-indigo-500

hover:scale-110

transition
"
>

<Plus size={18}/>

</button>


</div>





<div
className="
flex
flex-wrap
gap-3
"
>


{

skills.length

?

skills.map((skill,index)=>(


<div

key={index}

className="
px-4
py-3

rounded-2xl

bg-gradient-to-r

from-indigo-50

to-purple-50


dark:from-indigo-950/40

dark:to-purple-950/40


border

border-indigo-100

dark:border-indigo-900

"
>


<p
className="
font-semibold

text-slate-900

dark:text-white
"
>

{skill.name}

</p>


<p
className="
text-xs

text-slate-500

dark:text-slate-400
"
>

{skill.level || "Beginner"}

</p>


</div>


))


:

<p
className="
text-slate-500

dark:text-slate-400
"
>

No skills added yet

</p>


}



</div>



</div>


)

}