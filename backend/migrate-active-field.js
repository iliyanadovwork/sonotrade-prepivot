// Run this script with: mongosh your-database-name migrate-active-field.js
// Or paste it directly into mongosh after connecting to your database

// Update all events that don't have the 'active' field
const result = db.events.updateMany(
  { active: { $exists: false } },
  { $set: { active: true } }
);

print(`Migration completed!`);
print(`Matched documents: ${result.matchedCount}`);
print(`Modified documents: ${result.modifiedCount}`);

// Verify the results
const totalEvents = db.events.countDocuments();
const activeEvents = db.events.countDocuments({ active: { $ne: false } });
const inactiveEvents = db.events.countDocuments({ active: false });

print(`\nSummary:`);
print(`Total events: ${totalEvents}`);
print(`Active events: ${activeEvents}`);
print(`Inactive events: ${inactiveEvents}`);
