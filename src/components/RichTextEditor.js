import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder, disabled = false , isArabic = false }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      [{ 'align': [] } ,{ direction: 'rtl' }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'align', 'direction',
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={{
          backgroundColor: disabled ? '#f5f5f5' : 'white',
        }}
      />
      <style jsx>{`
        .rich-text-editor .ql-editor {
          min-height: 120px;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #ddd;
          border-left: 1px solid #ddd;
          border-right: 1px solid #ddd;
          border-bottom: none;
          border-radius: 4px 4px 0 0;
        }
        
        .rich-text-editor .ql-container {
          border-left: 1px solid #ddd;
          border-right: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 4px 4px;
        }
        
        .rich-text-editor .ql-editor:focus {
          outline: none;
        }
        
        .rich-text-editor .ql-toolbar.ql-snow {
          background-color: #f8f9fa;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #999;
          font-style: normal;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
