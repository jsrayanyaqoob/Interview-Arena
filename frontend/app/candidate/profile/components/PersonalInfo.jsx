import {
User,
Mail,
Phone,
MapPin,
Briefcase,
Globe,
Code2,
Link
}
from "lucide-react";



export default function PersonalInfo({
user,
formData,
editing,
updateField
}){


const fields=[

{
icon:User,
label:"Name",
value:user?.name
},

{
icon:Mail,
label:"Email",
value:user?.email
},

{
icon:Phone,
label:"Phone",
key:"phone",
value:formData.phone
},

{
icon:MapPin,
label:"Location",
key:"location",
value:formData.location
},

{
icon:Briefcase,
label:"Title",
key:"title",
value:formData.title
},

{
icon:Globe,
label:"Portfolio",
key:"portfolioUrl",
value:formData.portfolioUrl
},

{
icon:Code2,
label:"Github",
key:"githubUrl",
value:formData.githubUrl
},

{
icon:Link,
label:"LinkedIn",
key:"linkedinUrl",
value:formData.linkedinUrl
}

];



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


<h3
className="
text-xl
font-semibold

text-slate-900
dark:text-white

mb-5
"
>

Personal Information

</h3>



<div
className="
grid
md:grid-cols-2

gap-4
"
>


{

fields.map((field,i)=>{


const Icon=field.icon;



const editable =
field.key &&
field.key!=="email";



return (

<div

key={i}

className="
p-4

rounded-2xl

bg-slate-50

dark:bg-slate-800

border

border-slate-100

dark:border-slate-700
"

>


<div
className="
flex
gap-3
"
>


<div
className="
p-2

rounded-xl

bg-indigo-100

dark:bg-indigo-950

text-indigo-500
"
>

<Icon size={18}/>

</div>



<div
className="flex-1"
>


<p
className="
text-xs

uppercase

text-slate-500

dark:text-slate-400
"
>

{field.label}

</p>



{
editing && editable

?

<input

value={field.value || ""}

onChange={
e=>
updateField(
field.key,
e.target.value
)
}

className="
mt-1

w-full

px-3
py-2

rounded-lg

bg-white

dark:bg-slate-900

border

border-slate-200

dark:border-slate-700

text-slate-900

dark:text-white

outline-none

focus:ring-2

focus:ring-indigo-500
"

/>


:

<a

href={
field.key?.includes("Url")
?
field.value
:
undefined
}

target="_blank"

className="
mt-1

block

text-sm

font-medium

text-slate-900

dark:text-white

truncate

hover:text-indigo-500

transition
"

>

{
field.value
||
"Not set"
}

</a>


}



</div>


</div>


</div>

)

})


}



</div>



</div>


)


}
