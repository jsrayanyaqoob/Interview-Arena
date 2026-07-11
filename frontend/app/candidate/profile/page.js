'use client';

import { useEffect, useState } from 'react';
import {
  Edit3,
  Save,
  Loader2,
  CheckCircle,
  X,
  User,
  MapPin,
  Award,
  Briefcase,
  FileText
} from 'lucide-react';

import { candidateService } from '@/lib/services/candidateService';
import { useAuth } from '@/context/AuthContext';

import ProfileHeader from './components/ProfileHeader';
import PersonalInfo from './components/PersonalInfo';
import SkillsCard from './components/SkillsCard';
import ExperienceCard from './components/ExperienceCard';
import ResumeCard from './components/ResumeCard';


export default function ProfilePage() {

  const { user } = useAuth();

  const [profile,setProfile] = useState(null);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);

  const [editing,setEditing] = useState(false);

  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');

  const [formData,setFormData] = useState({
    phone:'',
    location:'',
    title:'',
    bio:'',
    portfolioUrl:'',
    githubUrl:'',
    linkedinUrl:'',
    company:''
  });


  useEffect(()=>{

    const loadProfile = async()=>{

      try{

        const data = await candidateService.getProfile();

        const p=data.profile;

        setProfile(p);


        setFormData({

          phone:p.phone || '',
          location:p.location || '',
          title:p.title || '',
          bio:p.bio || '',
          portfolioUrl:p.portfolioUrl || '',
          githubUrl:p.githubUrl || '',
          linkedinUrl:p.linkedinUrl || '',
          company:p.company || ''

        });


      }
      catch(err){

        setError(err.message);

      }
      finally{

        setLoading(false);

      }

    };


    loadProfile();


  },[]);



  const updateField=(key,value)=>{

    setFormData(prev=>({

      ...prev,
      [key]:value

    }));

  };




  const handleSave=async()=>{


    try{


      setSaving(true);
      setError('');
      setSuccess('');



      const result =
      await candidateService.updateProfile(formData);



      setProfile(prev=>({

        ...prev,
        ...result.profile

      }));


      setSuccess(
        "Profile updated successfully"
      );


      setEditing(false);


    }
    catch(err){

      setError(err.message);

    }
    finally{

      setSaving(false);

    }

  };



  if(loading){

    return (

      <div className="
      min-h-screen
      flex
      items-center
      justify-center

      bg-gradient-to-br
      from-slate-50
      via-indigo-50
      to-purple-50

      dark:from-slate-950
      dark:via-slate-900
      dark:to-purple-950
      ">

        <Loader2
        className="
        w-10
        h-10
        animate-spin
        text-indigo-500
        "
        />

      </div>

    );

  }



  return (

<div
className="
min-h-screen

bg-gradient-to-br
from-slate-50
via-indigo-50/40
to-purple-50

dark:from-slate-950
dark:via-indigo-950/20
dark:to-purple-950

p-5
lg:p-10
"
>



{/* TOP HEADER */}

<div
className="
flex
flex-col
md:flex-row
justify-between
gap-5
mb-8
"
>


<div>

<h1
className="
text-3xl
font-bold

text-slate-900
dark:text-white
"
>
Profile Management
</h1>


<p
className="
mt-2
text-slate-500
dark:text-slate-400
"
>
Manage your professional profile
</p>


</div>




<button

onClick={()=>
editing
?
handleSave()
:
setEditing(true)
}


disabled={saving}


className="
flex
items-center
justify-center
gap-2

px-6
py-3

rounded-xl

bg-gradient-to-r
from-indigo-500
to-purple-500

text-white

font-semibold

shadow-lg
shadow-indigo-500/20

hover:scale-105

transition
"

>


{
saving

?
<Loader2 className="animate-spin w-5 h-5"/>

:

editing

?
<Save size={18}/>

:

<Edit3 size={18}/>

}



{
editing
?
"Save Changes"
:
"Edit Profile"
}


</button>


</div>





{/* ALERTS */}


{
success &&

<div
className="
mb-6
flex
gap-3
items-center

p-4
rounded-xl

bg-emerald-50

dark:bg-emerald-900/20

text-emerald-700
dark:text-emerald-400
"
>

<CheckCircle/>

{success}

</div>

}



{
error &&

<div
className="
mb-6
flex
gap-3
items-center

p-4
rounded-xl

bg-red-50

dark:bg-red-900/20

text-red-600
"
>

<X/>

{error}

</div>

}





<div
className="
grid

xl:grid-cols-3

gap-6
"
>


{/* LEFT */}


<div
className="
space-y-6
"
>


<ProfileHeader

user={user}

profile={profile}

formData={formData}

/>


<ResumeCard
profile={profile}
/>



</div>





{/* RIGHT */}


<div
className="
xl:col-span-2

space-y-6
"
>


<PersonalInfo

user={user}

formData={formData}

editing={editing}

updateField={updateField}

/>



<SkillsCard

skills={profile?.skills || []}

/>



<ExperienceCard

experience={
profile?.workExperience || []
}

/>



</div>


</div>



</div>


  );

}