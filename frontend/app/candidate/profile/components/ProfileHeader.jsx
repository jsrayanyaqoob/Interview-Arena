import {
  Camera,
  MapPin
} from "lucide-react";


export default function ProfileHeader({
  user,
  formData,
  profile
}) {


const completion =
profile?.profileCompletion || 0;


return (

<div
className="
p-6
rounded-3xl

bg-white/80
dark:bg-slate-900/70

backdrop-blur-xl

border
border-slate-200
dark:border-slate-700

shadow-xl
shadow-indigo-500/5
"
>


<div className="text-center">


<div className="relative inline-block">


<div
className="
w-28
h-28

rounded-full

bg-gradient-to-br
from-indigo-500
via-purple-500
to-pink-500

flex
items-center
justify-center

text-white
text-4xl
font-bold

shadow-2xl

ring-4
ring-indigo-500/20
"
>

{
user?.name
?.split(" ")
.map(n=>n[0])
.join("")
|| "U"
}


</div>


<button
className="
absolute
bottom-0
right-0

p-2

rounded-full

bg-white
dark:bg-slate-800

shadow-lg

border
border-slate-200
dark:border-slate-700

hover:scale-110

transition
"
>

<Camera
size={16}
className="
text-indigo-500
"
/>


</button>


</div>




<h2
className="
mt-4

text-xl
font-bold

text-slate-900
dark:text-white
"
>

{user?.name || "User"}

</h2>



<p
className="
text-sm

text-slate-500
dark:text-slate-400
"
>

{formData.title || user?.role}

</p>




<div
className="
mt-3

flex
justify-center
items-center
gap-2

text-sm

text-slate-500
dark:text-slate-400
"
>

<MapPin size={15}/>

{
formData.location
||
"Location not set"
}


</div>





<div
className="
mt-6

pt-5

border-t

border-slate-200
dark:border-slate-700
"
>


<div
className="
flex
justify-between

text-sm
mb-2
"
>


<span
className="
text-slate-500
dark:text-slate-400
"
>
Profile Completion
</span>



<span
className="
font-semibold
text-indigo-500
"
>
{completion}%
</span>



</div>



<div
className="
h-2

rounded-full

bg-slate-200

dark:bg-slate-700

overflow-hidden
"
>


<div

style={{
width:`${completion}%`
}}

className="
h-full

rounded-full

bg-gradient-to-r
from-indigo-500
to-purple-500
"

/>


</div>



</div>





</div>



</div>

)

}