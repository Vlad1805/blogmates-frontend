import { useEffect, useState } from "react";
import BlogCardComponent from "./BlogCardComponent";
import { CreatePostResponse, UserDataResponse, getUserProfile } from "@/api/blogmates-backend";
import { useNavigate } from "react-router-dom";

const PREVIEW_CHAR_LIMIT = 300;
const PREVIEW_LINE_LIMIT = 8;

interface BlogResultComponentProps {
  post: CreatePostResponse;
  onClick?: () => void;
}

export default function BlogResultComponent({ post, onClick }: BlogResultComponentProps) {
  const [authorProfile, setAuthorProfile] = useState<UserDataResponse | undefined>(undefined);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const profile = await getUserProfile(post.author_name);
        if (isMounted) setAuthorProfile(profile);
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchProfile();
    return () => { isMounted = false; };
  }, [post.author_name]);

  const handleToggleExpand = () => {
    setExpanded((prev) => !prev);
    if (onClick) onClick();
  };

  const isContentLong = (content: string) => {
    const lines = content.split(/\r?\n/);
    return content.length > PREVIEW_CHAR_LIMIT || lines.length > PREVIEW_LINE_LIMIT;
  };

  const getPreviewContent = (content: string) => {
    const lines = content.split(/\r?\n/);
    if (lines.length > PREVIEW_LINE_LIMIT) {
      return lines.slice(0, PREVIEW_LINE_LIMIT).join("\n") + "...";
    }
    if (content.length > PREVIEW_CHAR_LIMIT) {
      return content.slice(0, PREVIEW_CHAR_LIMIT) + "...";
    }
    return content;
  };

  const handleAvatarClick = (username: string) => {
    navigate(`/profile/${username}`);
  };
  const longContent = isContentLong(post.content);
  const contentToShow = expanded || !longContent ? post.content : getPreviewContent(post.content);
  return (
      <BlogCardComponent
        post={post}
        authorProfile={authorProfile}
        expanded={expanded}
        onAvatarClick={handleAvatarClick}
        onToggleExpand={handleToggleExpand}
        isContentLong={longContent}
        contentToShow={contentToShow}
      />
  );
} 