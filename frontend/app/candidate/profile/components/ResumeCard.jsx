import {
FileText,
Upload,
CheckCircle
}
from "lucide-react";


export default function ResumeCard({
profile
}){


const uploadResume=(e)=>{

const file=e.target.files[0];


if(!file)
return;


// connect your API here
console.log(file);

};



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

mb-5
"
>

<FileText
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

Resume

</h3>


</div>




{

profile?.resumeUrl

?

<div

className="
flex
items-center
gap-3

p-4

rounded-xl

bg-emerald-50

dark:bg-emerald-950/30
"

>


<CheckCircle
className="text-emerald-500"
/>


<p
className="
text-emerald-700

dark:text-emerald-400
"
>

Resume Uploaded

</p>


</div>


:

<label

className="
cursor-pointer

block

text-center

p-8

rounded-2xl

border-2

border-dashed

border-indigo-300

dark:border-indigo-700

hover:bg-indigo-50

dark:hover:bg-indigo-950/30

transition
"

>


<Upload

className="
mx-auto

mb-3

text-indigo-500
"

/>


<p
className="
font-semibold

text-slate-900

dark:text-white
"
>

Upload Resume

</p>


<p
className="
text-sm

text-slate-500
"
>

PDF / DOCX

</p>



<input

type="file"

hidden

accept=".pdf,.doc,.docx"

onChange={uploadResume}

/>


</label>


}



</div>


)

}