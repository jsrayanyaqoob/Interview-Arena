import {
Briefcase
}
from "lucide-react";


export default function ExperienceCard({
experience=[]
}){


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
items-center
gap-2

mb-6
"
>

<Briefcase
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

Work Experience

</h3>


</div>





<div
className="
space-y-6
"
>


{

experience.length

?

experience.map((exp,index)=>(


<div

key={index}

className="
relative

pl-6

border-l-2

border-indigo-300

dark:border-indigo-700
"

>


<div

className="
absolute
left-[-6px]
top-1
w-3
h-3
rounded-full
bg-indigo-500
"
/>




<h4
className="
font-bold

text-slate-900

dark:text-white
"
>

{exp.role}

</h4>



<p
className="
text-sm

text-slate-500

dark:text-slate-400
"
>

{exp.company}

{" • "}

{
exp.current
?
"Present"
:
exp.endDate
?
new Date(exp.endDate)
.getFullYear()
:
""
}


</p>



{
exp.description &&

<p
className="
mt-2

text-sm

text-slate-600

dark:text-slate-400
"
>

{exp.description}

</p>

}



</div>


))


:

<p
className="
text-slate-500

dark:text-slate-400
"
>

No experience added yet

</p>


}



</div>


</div>


)

}