import { ImageUploadNode } from '@/tiptap/components/tiptap-node/image-upload-node';
import { Spacer } from '@/tiptap/components/tiptap-ui-primitive/spacer';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/tiptap/components/tiptap-ui-primitive/toolbar';
import { HeadingDropdownMenu } from '@/tiptap/components/tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/tiptap/components/tiptap-ui/image-upload-button';
import { LinkPopover } from '@/tiptap/components/tiptap-ui/link-popover';
import { ListDropdownMenu } from '@/tiptap/components/tiptap-ui/list-dropdown-menu';
import { MarkButton } from '@/tiptap/components/tiptap-ui/mark-button';
import { TextAlignButton } from '@/tiptap/components/tiptap-ui/text-align-button';
import { UndoRedoButton } from '@/tiptap/components/tiptap-ui/undo-redo-button';
import { handleImageUpload, MAX_FILE_SIZE } from '@/tiptap/lib/tiptap-utils';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useEffect } from 'react';
import './TipTapEditor.scss';

const TiptapToolbarContent = () => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2]} />
        <ListDropdownMenu types={['bulletList', 'orderedList']} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="underline" />
        <LinkPopover />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="사진 추가" />
      </ToolbarGroup>

      <Spacer />
    </>
  );
};

interface TiptapEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': '내용 입력 영역',
        class: 'tiptap-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        blockquote: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error('Upload failed:', error),
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="tiptap-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar>
          <TiptapToolbarContent />
        </Toolbar>
        <EditorContent editor={editor} role="presentation" className="tiptap-editor-content" />
      </EditorContext.Provider>
    </div>
  );
}
