import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import '@/blockly/blocks/aiBlocks'; // 导入自定义积木
import { toolboxConfig } from '@/blockly/toolbox';
import 'blockly/blocks'; // 导入内置积木

/**
 * BlocklyEditor 组件
 * 集成 Google Blockly 到 React 应用
 */
export default function BlocklyEditor({
  initialBlocks,
  onWorkspaceChange,
  onCodeGenerate,
  readOnly = false,
  toolbox = toolboxConfig,
  className = ''
}) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      // 初始化 Blockly 工作区
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox,
        readOnly,
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        },
        trashcan: true,
        scrollbars: true,
        sounds: false,
        oneBasedIndex: false
      });

      // 加载初始积木
      if (initialBlocks) {
        try {
          const json = JSON.parse(initialBlocks);
          Blockly.serialization.workspaces.load(json, workspace.current);
        } catch (error) {
          console.error('Failed to load initial blocks:', error);
        }
      }

      // 监听工作区变化
      workspace.current.addChangeListener((event) => {
        // 忽略 UI 事件，只处理实际的积木变化
        if (event.type !== Blockly.Events.UI) {
          // 获取工作区的 JSON 表示
          const json = Blockly.serialization.workspaces.save(workspace.current);
          const jsonString = JSON.stringify(json);

          // 生成 JavaScript 代码
          const code = javascriptGenerator.workspaceToCode(workspace.current);

          // 调用回调函数
          onWorkspaceChange?.(jsonString);
          onCodeGenerate?.(code);
        }
      });

      // 窗口大小改变时调整工作区
      const handleResize = () => {
        Blockly.svgResize(workspace.current);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        workspace.current?.dispose();
        workspace.current = null;
      };
    }
  }, [initialBlocks, toolbox, readOnly]);

  // 提供给父组件的方法：获取当前工作区的 JSON
  useEffect(() => {
    if (workspace.current) {
      window.getBlocklyWorkspace = () => workspace.current;
    }
  }, []);

  return (
    <div
      ref={blocklyDiv}
      className={`blockly-workspace ${className}`}
      style={{ height: '100%', width: '100%' }}
    />
  );
}
