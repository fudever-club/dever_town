// Node test: pose FSM transitions (src/config/poseConfig.js là pure JS, không phụ thuộc Phaser)
import assert from 'node:assert/strict';
import {
  POSE, SIT_ANIM, SIT_TYPE_TO_POSE,
  canTransitionPose, sitTypeToPose, isSitPose, POSE_MOVEMENT,
} from '../src/config/poseConfig.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('PASS:', name); };

// --- 1. Hằng số pose ---
ok('POSE constants', () => {
  assert.equal(POSE.STAND, 'stand');
  assert.equal(POSE.SIT_UPRIGHT, 'sit_upright');
  assert.equal(POSE.SIT_LEANBACK, 'sit_leanback');
});
ok('SIT_ANIM tags khớp frameTags', () => {
  assert.equal(SIT_ANIM[POSE.SIT_UPRIGHT], 'sit_upright');
  assert.equal(SIT_ANIM[POSE.SIT_LEANBACK], 'sit_leanback');
});

// --- 2. Bảng chuyển đổi FSM ---
ok('STAND -> SIT_* được phép', () => {
  assert.equal(canTransitionPose(POSE.STAND, POSE.SIT_UPRIGHT), true);
  assert.equal(canTransitionPose(POSE.STAND, POSE.SIT_LEANBACK), true);
});
ok('SIT_* -> STAND được phép', () => {
  assert.equal(canTransitionPose(POSE.SIT_UPRIGHT, POSE.STAND), true);
  assert.equal(canTransitionPose(POSE.SIT_LEANBACK, POSE.STAND), true);
});
ok('SIT_UPRIGHT <-> SIT_LEANBACK được phép (đổi ghế)', () => {
  assert.equal(canTransitionPose(POSE.SIT_UPRIGHT, POSE.SIT_LEANBACK), true);
  assert.equal(canTransitionPose(POSE.SIT_LEANBACK, POSE.SIT_UPRIGHT), true);
});
ok('giữ nguyên pose là no-op hợp lệ', () => {
  assert.equal(canTransitionPose(POSE.STAND, POSE.STAND), true);
  assert.equal(canTransitionPose(POSE.SIT_UPRIGHT, POSE.SIT_UPRIGHT), true);
});
ok('pose lạ bị từ chối', () => {
  assert.equal(canTransitionPose('flying', POSE.STAND), false);
  assert.equal(canTransitionPose(POSE.STAND, 'lying'), false);
  assert.equal(canTransitionPose(undefined, POSE.STAND), false);
});

// --- 3. sitTypeToPose ---
ok('sit type mapping', () => {
  assert.equal(sitTypeToPose('upright'), POSE.SIT_UPRIGHT);
  assert.equal(sitTypeToPose('leanback'), POSE.SIT_LEANBACK);
  assert.equal(sitTypeToPose('crouch'), null);
  assert.equal(sitTypeToPose(undefined), null);
  assert.deepEqual(SIT_TYPE_TO_POSE, { upright: 'sit_upright', leanback: 'sit_leanback' });
});

// --- 4. isSitPose ---
ok('isSitPose', () => {
  assert.equal(isSitPose(POSE.SIT_UPRIGHT), true);
  assert.equal(isSitPose(POSE.SIT_LEANBACK), true);
  assert.equal(isSitPose(POSE.STAND), false);
});

// --- 5. Hằng số chống drift ---
ok('POSE_MOVEMENT thresholds hợp lệ', () => {
  assert.ok(POSE_MOVEMENT.autoStandUpFrames >= 5, 'đủ lâu để lọc drift');
  assert.ok(POSE_MOVEMENT.autoStandUpMinMagnitudeSq > 0 && POSE_MOVEMENT.autoStandUpMinMagnitudeSq < 1);
});

// --- 6. Mô phỏng luồng FSM đầy đủ ---
ok('full flow: stand -> sit upright -> switch leanback -> stand', () => {
  let pose = POSE.STAND;
  const go = (next) => {
    assert.equal(canTransitionPose(pose, next), true, `${pose} -> ${next}`);
    pose = next;
  };
  go(sitTypeToPose('upright'));   // ngồi thẳng
  assert.equal(isSitPose(pose), true);
  go(sitTypeToPose('leanback'));  // đổi sang ngả lưng
  go(POSE.STAND);                 // đứng dậy
  assert.equal(isSitPose(pose), false);
});
ok('sit() với type sai không đổi pose', () => {
  assert.equal(sitTypeToPose('banana'), null);
});

console.log(`\nAll ${passed} pose FSM tests passed.`);
