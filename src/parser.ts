import {convertableToString, parseStringPromise} from 'xml2js';
import { z } from "zod";

const TestCase = z.object({
    $: z.object({
        name: z.string(),
        classname: z.string().optional(),
        group: z.string().optional(),
        // FIXME: Can I enforce regex from schema?
        time: z.string(),
    }),
    error: z.array(z.object({})).optional(),
    failure: z.array(z.object({})).optional(),
    skipped: z.array(z.object({})).optional(),
})

type TestCase = z.infer<typeof TestCase>

const TestSuite = z.object({
    testcase: z.array(TestCase)
})

const SurefireTestReport = z.object({
    testsuite: TestSuite
})

type TestCaseResult = 
    | 'passed'
    | 'failed'
    | 'error'
    | 'skipped'

interface TestCaseDomain {
    classname?: string
    name: string
    time: number
    result: TestCaseResult
}

const parseSurefireTime = (input: string): number => {
    // FIXME: This returns NaN if it can't be parsed, should handle this case
    return parseFloat(input)
}

// FIXME: Should return a Result type and check for some error cases
const parseSurefireXML = async (input: convertableToString): Promise<TestCaseDomain[]> => {
    const xmlAsJson = await parseStringPromise(input)
    const parsedJson = SurefireTestReport.parse(xmlAsJson)
    return parsedJson.testsuite.testcase.map((tc: TestCase): TestCaseDomain => {
        return {
            classname: tc.$.classname,
            name: tc.$.name,
            time: parseSurefireTime(tc.$.time),
            result: tc.error ? 'error' : (tc.failure ? 'failed' : (tc.skipped ? 'skipped' : 'passed'))
        }
    })
}

export default parseSurefireXML
