import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

/**
 * AI 功能积木定义
 * 包含图像识别、文本生成等 AI 相关积木
 */

// ===== 图像识别积木 =====
Blockly.Blocks['ai_image_recognition'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🖼️ 识别图片');
    this.appendValueInput('IMAGE')
        .setCheck('String')
        .appendField('图片:');
    this.appendValueInput('PROMPT')
        .setCheck('String')
        .appendField('提示词:');
    this.setOutput(true, 'String');
    this.setColour(270); // 紫色 - AI 相关
    this.setTooltip('使用 AI 识别图片内容');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['ai_image_recognition'] = function(block, generator) {
  const image = generator.valueToCode(block, 'IMAGE', javascriptGenerator.ORDER_ATOMIC) || '""';
  const prompt = generator.valueToCode(block, 'PROMPT', javascriptGenerator.ORDER_ATOMIC) || '"请描述这张图片"';

  const code = `await recognizeImage(${image}, ${prompt})`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// ===== AI 文本生成积木 =====
Blockly.Blocks['ai_text_generate'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🤖 AI 生成文本');
    this.appendValueInput('PROMPT')
        .setCheck('String')
        .appendField('提示词:');
    this.setOutput(true, 'String');
    this.setColour(270);
    this.setTooltip('使用 AI 生成文本内容');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['ai_text_generate'] = function(block, generator) {
  const prompt = generator.valueToCode(block, 'PROMPT', javascriptGenerator.ORDER_ATOMIC) || '""';

  const code = `await generateText(${prompt})`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// ===== 上传图片积木 =====
Blockly.Blocks['io_upload_image'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📤 上传的图片');
    this.setOutput(true, 'String');
    this.setColour(160); // 绿色 - 输入输出
    this.setTooltip('获取用户上传的图片');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['io_upload_image'] = function(block, generator) {
  const code = 'getUploadedImage()';
  return [code, javascriptGenerator.ORDER_FUNCTION_CALL];
};

// ===== 显示结果积木 =====
Blockly.Blocks['io_display_result'] = {
  init: function() {
    this.appendValueInput('RESULT')
        .setCheck(null)
        .appendField('📺 显示结果:');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip('在预览区显示结果');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['io_display_result'] = function(block, generator) {
  const result = generator.valueToCode(block, 'RESULT', javascriptGenerator.ORDER_ATOMIC) || '""';

  const code = `displayResult(${result});\n`;
  return code;
};

// ===== 获取用户输入积木 =====
Blockly.Blocks['io_get_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('⌨️ 获取用户输入');
    this.appendValueInput('MESSAGE')
        .setCheck('String')
        .appendField('提示信息:');
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('获取用户在输入框中输入的内容');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['io_get_input'] = function(block, generator) {
  const message = generator.valueToCode(block, 'MESSAGE', javascriptGenerator.ORDER_ATOMIC) || '"请输入内容"';

  const code = `await getUserInput(${message})`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// ===== 等待积木 =====
Blockly.Blocks['logic_wait'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('⏱️ 等待')
        .appendField(new Blockly.FieldNumber(1, 0, 10, 0.1), 'SECONDS')
        .appendField('秒');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210); // 蓝色 - 逻辑
    this.setTooltip('暂停执行指定的秒数');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['logic_wait'] = function(block, generator) {
  const seconds = block.getFieldValue('SECONDS');

  const code = `await wait(${seconds});\n`;
  return code;
};

// ===== 文本积木 =====
Blockly.Blocks['text_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('文本'), 'TEXT');
    this.setOutput(true, 'String');
    this.setColour(230); // 黄色 - 文本
    this.setTooltip('文本值');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['text_value'] = function(block, generator) {
  const text = block.getFieldValue('TEXT');
  const code = `"${text}"`;
  return [code, javascriptGenerator.ORDER_ATOMIC];
};

export default {
  // 导出所有自定义积木，确保它们被注册
  blocks: [
    'ai_image_recognition',
    'ai_text_generate',
    'io_upload_image',
    'io_display_result',
    'io_get_input',
    'logic_wait',
    'text_value'
  ]
};
