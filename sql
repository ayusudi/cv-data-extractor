set question = 'I am a Project Management. I need to create system inventory management. What kind of skill I need to my developer?'

WITH context AS (
    SELECT 
        name,
        chunk_text,
        snowflake.cortex.embed_text_1024('snowflake-arctic-embed-l-v2.0', chunk_text) AS embedding
    FROM 
        "HELP_PM"."PUBLIC"."CONTENT_CHUNKS"
    QUALIFY ROW_NUMBER() OVER (PARTITION BY name ORDER BY name) = 1
    ORDER BY 
        vector_cosine_similarity(embedding, snowflake.cortex.embed_text_1024('snowflake-arctic-embed-l-v2.0', $question)) DESC
    LIMIT 10
),
concatenated_context AS (
    SELECT 
        LISTAGG(chunk_text, ' ') WITHIN GROUP (ORDER BY name) AS combined_context
    FROM context
)
SELECT 
    snowflake.cortex.complete(
        'mistral-large2', 
        'Here is our analysis of our employee, please just select the related employee who can help to our question. Make sure your narative is explain the project and the reason ' || 
        '###
        CONTEXT: ' || concatenated_context.combined_context || '
        ###
        QUESTION: ' || $question || '
        ANSWER: '
    ) AS response
FROM concatenated_context;