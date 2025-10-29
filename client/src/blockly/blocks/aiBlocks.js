import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

/**
 * AI 功能积木定义
 * 包含图像识别、文本生成等 AI 相关积木
 * 颜色优化：使用更友好的HSL颜色值
 */

// 颜色定义（更现代、更友好）
const COLORS = {
  AI: '#9333EA',        // 紫色 - AI功能 (purple-600)
  IO: '#10B981',        // 绿色 - 输入输出 (emerald-500)
  LOGIC: '#3B82F6',     // 蓝色 - 逻辑 (blue-500)
  MATH: '#F59E0B',      // 橙色 - 数学 (amber-500)
  TEXT: '#06B6D4',      // 青色 - 文本 (cyan-500)
  VARIABLE: '#EF4444'   // 红色 - 变量 (red-500)
};

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
    this.setColour(COLORS.AI);
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
    this.setColour(COLORS.AI);
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
    this.setColour(COLORS.IO);
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
    this.setColour(COLORS.IO);
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
    this.setColour(COLORS.IO);
    this.setTooltip('获取用户在输入框中输入的内容');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['io_get_input'] = function(block, generator) {
  const message = generator.valueToCode(block, 'MESSAGE', javascriptGenerator.ORDER_ATOMIC) || '"请输入内容"';

  const code = `await getUserInput(${message})`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// ===== 显示消息积木（新增）=====
Blockly.Blocks['io_show_message'] = {
  init: function() {
    this.appendValueInput('MESSAGE')
        .setCheck('String')
        .appendField('💬 显示消息:');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.IO);
    this.setTooltip('显示一条消息给用户');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['io_show_message'] = function(block, generator) {
  const message = generator.valueToCode(block, 'MESSAGE', javascriptGenerator.ORDER_ATOMIC) || '""';

  const code = `alert(${message});\n`;
  return code;
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
    this.setColour(COLORS.LOGIC);
    this.setTooltip('暂停执行指定的秒数');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['logic_wait'] = function(block, generator) {
  const seconds = block.getFieldValue('SECONDS');

  const code = `await wait(${seconds});\n`;
  return code;
};

// ===== 如果...那么...积木（简化版，适合小学生）=====
Blockly.Blocks['logic_if_simple'] = {
  init: function() {
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('🔵 如果');
    this.appendStatementInput('DO')
        .appendField('那么');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LOGIC);
    this.setTooltip('如果条件成立，执行下面的操作');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['logic_if_simple'] = function(block, generator) {
  const condition = generator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_ATOMIC) || 'false';
  const doCode = generator.statementToCode(block, 'DO');

  const code = `if (${condition}) {\n${doCode}}\n`;
  return code;
};

// ===== 如果...那么...否则...积木 =====
Blockly.Blocks['logic_if_else'] = {
  init: function() {
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('🔵 如果');
    this.appendStatementInput('DO_TRUE')
        .appendField('那么');
    this.appendStatementInput('DO_FALSE')
        .appendField('否则');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LOGIC);
    this.setTooltip('如果条件成立执行第一组操作，否则执行第二组操作');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['logic_if_else'] = function(block, generator) {
  const condition = generator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_ATOMIC) || 'false';
  const doTrue = generator.statementToCode(block, 'DO_TRUE');
  const doFalse = generator.statementToCode(block, 'DO_FALSE');

  const code = `if (${condition}) {\n${doTrue}} else {\n${doFalse}}\n`;
  return code;
};

// ===== 重复...次积木 =====
Blockly.Blocks['loop_repeat'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🔁 重复')
        .appendField(new Blockly.FieldNumber(3, 1, 100, 1), 'TIMES')
        .appendField('次');
    this.appendStatementInput('DO')
        .appendField('执行');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LOGIC);
    this.setTooltip('重复执行指定次数的操作');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['loop_repeat'] = function(block, generator) {
  const times = block.getFieldValue('TIMES');
  const doCode = generator.statementToCode(block, 'DO');

  const code = `for (let i = 0; i < ${times}; i++) {\n${doCode}}\n`;
  return code;
};

// ===== 数字比较积木 =====
Blockly.Blocks['logic_compare_number'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['等于', '=='],
          ['大于', '>'],
          ['小于', '<'],
          ['大于等于', '>='],
          ['小于等于', '<='],
          ['不等于', '!=']
        ]), 'OP');
    this.appendValueInput('B')
        .setCheck('Number');
    this.setOutput(true, 'Boolean');
    this.setColour(COLORS.LOGIC);
    this.setTooltip('比较两个数字');
    this.setHelpUrl('');
    this.setInputsInline(true);
  }
};

javascriptGenerator.forBlock['logic_compare_number'] = function(block, generator) {
  const a = generator.valueToCode(block, 'A', javascriptGenerator.ORDER_ATOMIC) || '0';
  const b = generator.valueToCode(block, 'B', javascriptGenerator.ORDER_ATOMIC) || '0';
  const op = block.getFieldValue('OP');

  const code = `(${a} ${op} ${b})`;
  return [code, javascriptGenerator.ORDER_RELATIONAL];
};

// ===== 文本比较积木 =====
Blockly.Blocks['logic_compare_text'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('String')
        .appendField('📝 文本');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['等于', '=='],
          ['包含', 'includes']
        ]), 'OP');
    this.appendValueInput('B')
        .setCheck('String');
    this.setOutput(true, 'Boolean');
    this.setColour(COLORS.LOGIC);
    this.setTooltip('比较两个文本');
    this.setHelpUrl('');
    this.setInputsInline(true);
  }
};

javascriptGenerator.forBlock['logic_compare_text'] = function(block, generator) {
  const a = generator.valueToCode(block, 'A', javascriptGenerator.ORDER_ATOMIC) || '""';
  const b = generator.valueToCode(block, 'B', javascriptGenerator.ORDER_ATOMIC) || '""';
  const op = block.getFieldValue('OP');

  let code;
  if (op === 'includes') {
    code = `(${a}.includes(${b}))`;
  } else {
    code = `(${a} ${op} ${b})`;
  }
  return [code, javascriptGenerator.ORDER_RELATIONAL];
};

// ===== 文本积木 =====
Blockly.Blocks['text_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('文本'), 'TEXT');
    this.setOutput(true, 'String');
    this.setColour(COLORS.TEXT);
    this.setTooltip('文本值');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['text_value'] = function(block, generator) {
  const text = block.getFieldValue('TEXT');
  const code = `"${text}"`;
  return [code, javascriptGenerator.ORDER_ATOMIC];
};

// ===== 数字积木 =====
Blockly.Blocks['number_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0), 'NUM');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.MATH);
    this.setTooltip('数字值');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['number_value'] = function(block, generator) {
  const num = block.getFieldValue('NUM');
  return [num, javascriptGenerator.ORDER_ATOMIC];
};

// ===== 数学运算积木 =====
Blockly.Blocks['math_operation'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['➕ 加', '+'],
          ['➖ 减', '-'],
          ['✖️ 乘', '*'],
          ['➗ 除', '/']
        ]), 'OP');
    this.appendValueInput('B')
        .setCheck('Number');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.MATH);
    this.setTooltip('进行数学运算');
    this.setHelpUrl('');
    this.setInputsInline(true);
  }
};

javascriptGenerator.forBlock['math_operation'] = function(block, generator) {
  const a = generator.valueToCode(block, 'A', javascriptGenerator.ORDER_ATOMIC) || '0';
  const b = generator.valueToCode(block, 'B', javascriptGenerator.ORDER_ATOMIC) || '0';
  const op = block.getFieldValue('OP');

  const code = `(${a} ${op} ${b})`;
  return [code, javascriptGenerator.ORDER_MULTIPLICATIVE];
};

// ===== 文本拼接积木 =====
Blockly.Blocks['text_join_simple'] = {
  init: function() {
    this.appendValueInput('TEXT1')
        .setCheck('String')
        .appendField('📝 合并文本');
    this.appendValueInput('TEXT2')
        .setCheck('String')
        .appendField('和');
    this.setOutput(true, 'String');
    this.setColour(COLORS.TEXT);
    this.setTooltip('把两段文本拼接在一起');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['text_join_simple'] = function(block, generator) {
  const text1 = generator.valueToCode(block, 'TEXT1', javascriptGenerator.ORDER_ATOMIC) || '""';
  const text2 = generator.valueToCode(block, 'TEXT2', javascriptGenerator.ORDER_ATOMIC) || '""';

  const code = `(${text1} + ${text2})`;
  return [code, javascriptGenerator.ORDER_ADDITION];
};

export default {
  // 导出所有自定义积木，确保它们被注册
  blocks: [
    'ai_image_recognition',
    'ai_text_generate',
    'io_upload_image',
    'io_display_result',
    'io_get_input',
    'io_show_message',
    'logic_wait',
    'logic_if_simple',
    'logic_if_else',
    'loop_repeat',
    'logic_compare_number',
    'logic_compare_text',
    'text_value',
    'number_value',
    'math_operation',
    'text_join_simple'
  ]
};

