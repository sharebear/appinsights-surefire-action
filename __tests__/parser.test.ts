import * as fs from 'fs';
import parseSurefireXML from '../src/parser';

test('smoke test example file', async () => {
  const data = await fs.promises.readFile(__dirname + '/testData.xml');
  const result = await parseSurefireXML(data)
  expect(result).toHaveLength(5)
})

test('should record error if error element is found', async () => {
  const data = `<?xml version="1.0" encoding="UTF-8"?>
  <testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report-3.0.xsd" version="3.0" name="SimpleTest" time="10.064" tests="5" errors="1" skipped="1" failures="1">
    <testcase name="should fail in unexpected ways" classname="SimpleTest" time="0.002">
      <error type="java.lang.RuntimeException"><![CDATA[java.lang.RuntimeException: Don't try this at home!
    at SimpleTest.should fail in unexpected ways(SimpleTest.kt:24)
  ]]></error>
    </testcase>
  </testsuite>`

  const result = await parseSurefireXML(data)
  expect(result[0].result).toBe('error')
  expect(result[0].classname).toBe('SimpleTest')
  expect(result[0].name).toBe('should fail in unexpected ways')
  expect(result[0].time).toBe(0.002)
})

test('should record failed if failure element is found', async () => {
  const data = `<?xml version="1.0" encoding="UTF-8"?>
  <testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report-3.0.xsd" version="3.0" name="SimpleTest" time="10.064" tests="5" errors="1" skipped="1" failures="1">
    <testcase name="should fail gracefully" classname="SimpleTest" time="0.033">
      <failure type="org.opentest4j.AssertionFailedError"><![CDATA[org.opentest4j.AssertionFailedError: Oh noes!
    at SimpleTest.should fail gracefully(SimpleTest.kt:19)
  ]]></failure>
    </testcase>
  </testsuite>
  `

  const result = await parseSurefireXML(data)
  expect(result[0].result).toBe('failed')
  expect(result[0].classname).toBe('SimpleTest')
  expect(result[0].name).toBe('should fail gracefully')
  expect(result[0].time).toBe(0.033)
})

test('should record skipped if skipped element is found', async () => {
  const data = `<?xml version="1.0" encoding="UTF-8"?>
  <testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report-3.0.xsd" version="3.0" name="SimpleTest" time="10.064" tests="5" errors="1" skipped="1" failures="1">
    <testcase name="should not be run" classname="SimpleTest" time="0">
      <skipped message="public final void SimpleTest.should not be run() is @Disabled"/>
    </testcase>
  </testsuite>
  `

  const result = await parseSurefireXML(data)
  expect(result[0].result).toBe('skipped')
  expect(result[0].classname).toBe('SimpleTest')
  expect(result[0].name).toBe('should not be run')
  expect(result[0].time).toBe(0)
})

test('should record passed none of the above are found', async () => {
  const data = `<?xml version="1.0" encoding="UTF-8"?>
  <testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report-3.0.xsd" version="3.0" name="SimpleTest" time="10.064" tests="5" errors="1" skipped="1" failures="1">
    <testcase name="should pass slowly" classname="SimpleTest" time="10.001"/>
  </testsuite>  
  `

  const result = await parseSurefireXML(data)
  expect(result[0].result).toBe('passed')
  expect(result[0].classname).toBe('SimpleTest')
  expect(result[0].name).toBe('should pass slowly')
  expect(result[0].time).toBe(10.001)
})
