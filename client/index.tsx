import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Builder from './Builder';
import styled from 'styled-components';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const widgetFiles: Record<string, string> = {};
const sampleDir = '/client/sample_apps/cubes';
const files = [
    '/index.tsx',
    '/App.tsx'
];

// Fetch and populate widget files
await Promise.all(files.map(async (file) => {
  const response = await fetch(`${sampleDir}/${file}`);
  const content = await response.text();
  widgetFiles[file] = content;
}));

const Layout = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 100px);
`;

const LeftColumn = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 500px;
`;

const RightColumn = styled.div`
  flex: 2;
  min-width: 0;
`;

const BuilderContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
  min-height: 500px;
  position: relative;
  height: 100%;
`;

const ApplyButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  
  &:hover {
    background: #45a049;
  }
`;

const Main = styled.div`
  font-family: monospace;
`;

const FileContent = styled.div`
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  background: #2d2d2d;
  max-height: 600px;
  overflow-y: auto;
`;

const FileTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #fff;
  border-bottom: 1px solid #888;
  padding: 5px 10px;
`;

const Feature = styled.span`
  background: #2d2d2d;
  padding: 2px 5px;
  border-radius: 5px;
`;

const Header = styled.div`
  text-align: center;

  a {
    color: #00ff00;
  }
`;

function App() {
  const [height, setHeight] = useState('auto');
  const [files, setFiles] = useState(widgetFiles);
  const [editedFiles, setEditedFiles] = useState(widgetFiles);
  const [hasChanges, setHasChanges] = useState(false);

  const handleCodeChange = (filename: string, newContent: string) => {
    setEditedFiles(prev => ({
      ...prev,
      [filename]: newContent
    }));
    setHasChanges(true);
  };

  const handleApplyChanges = () => {
    setFiles(editedFiles);
    setHasChanges(false);
  };

  return (
    <Main>
      <Header>
        <h1>Tsingtao</h1>
        <h2>Bundle & run TypeScript client code directly in the browser</h2>
          <p style={{color: '#ffffaa'}}>It works by (1) esbuild-wasm to bundle the code, (2) rewriting module references to CDNs so importing packages works without needing npm. Disclaimer: some npm packages may not work.</p>

          Clone on <a href="https://github.com/mayfer/tsingtao">GitHub</a>
      </Header>
      <Layout>
        <LeftColumn>
          {Object.entries(widgetFiles).map(([filename, content]) => (
            <FileContent key={filename}>
              <FileTitle>{filename}</FileTitle>
              <CodeMirror
                value={editedFiles[filename] || content}
                height={`${Math.max(100, editedFiles[filename]?.split('\n').length * 20 || content.split('\n').length * 20)}px`}
                theme={oneDark}
                extensions={[javascript({ typescript: true })]}
                onChange={(value) => handleCodeChange(filename, value)}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: false,
                  highlightActiveLine: false,
                  foldGutter: false,
                }}
              />
            </FileContent>
          ))}
        </LeftColumn>
        <RightColumn>
          <BuilderContainer>
            {hasChanges && (
              <ApplyButton onClick={handleApplyChanges}>
                Apply Changes
              </ApplyButton>
            )}
            <Builder 
              initialFiles={files}
              onResize={(height) => setHeight(`${height}px`)}
            />
          </BuilderContainer>
        </RightColumn>
      </Layout>
    </Main>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);