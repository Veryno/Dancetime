"use client";

import {FieldValues, SubmitHandler, useForm } from "react-hook-form";
import UseUploadModal from "../hooks/UseUploadModal";
import Modal from "./Modal";
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import toast from "react-hot-toast";
import { useUser } from "../hooks/useUser";
import uniqid from "uniqid";
import { SupabaseClient, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

const UploadModal = () => {
    const [isLoading, SetIsLoading] = useState(false);
    const UploadModal = UseUploadModal();
    const {user} = useUser();
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    
    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            author: '',
            title: '',
            song: null,
            image: null,
        }
    })
    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            UploadModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try{
            SetIsLoading(true);

            const imageFile = values.image?.[0];
            const songFile = values.song?.[0];
      
            if (!imageFile || !songFile || !user) {
              toast.error('Missing fields')
              return;
            }
    const uniqueID = uniqid();

            const {
                data: songData,
                error: songError,
            } = await supabaseClient
                .storage
                .from ('songs')
                .upload (`song-${values.title}-${uniqueID}`, songFile, {
                    cacheControl: '3600',
                    upsert: false
                });
            
                if (songError) {
                    SetIsLoading(false);
                    return toast.error('Failed song upload');
                }

                const {
                    data: imageData,
                    error: imageError,
                } = await supabaseClient
                    .storage
                    .from ('images')
                    .upload (`image-${values.title}-${uniqueID}`, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if(imageError) {
                    SetIsLoading(false);
                    return toast.error('Failed image upload');
                }

                const {
                    error: supabaseError
                } =await supabaseClient
                .from('songs')
                .insert({
                    user_id: user.id,
                    title: values.title,
                    author: values.author,
                    image_path: imageData.path,
                    song_path: songData.path
                }); 

            if (supabaseError){
                SetIsLoading(false);
                return toast.error(supabaseError.message);
            }


            router.refresh();
            SetIsLoading(false);
            toast.success('Song created!');
            reset();
            UploadModal.onClose();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            SetIsLoading(false);
        }
    }


    return (
        <Modal
            title="Upload a song"
            description="Upload a mp3 file"
            isOpen = {UploadModal.isOpen}
            onChange={onChange}
        >

            <form className="flex flex-col gap-y-4"
                onSubmit={handleSubmit(onSubmit)}>
                    <Input 
                        id="title"
                        disabled={isLoading}
                        {...register('title', {required: true})}
                        placeholder = "Song title"
                    />
                    <Input 
                        id="author"
                        disabled={isLoading}
                        {...register('author', {required: true})}
                        placeholder = "Song author"
                    />
                    <div>
                        <div className="pb-1">
                            Select a song file
                        </div>
                        <Input 
                        id="song"
                        type="file"
                        disabled={isLoading}
                        accept=".mp3"
                        {...register('song', {required: true})}
                    />
                    </div>
                    <div>
                        <div className="pb-1">
                            Select a song image
                        </div>
                        <Input 
                        id="image"
                        type="file"
                        disabled={isLoading}
                        accept="image/*"
                        {...register('image', {required: true})}
                    />
                    </div>
                    <Button disabled={isLoading} type="submit">
                        Create
                    </Button>
            </form>
        </Modal>
    );
}

export default UploadModal; 